package cisco

import java.io.{ File, PrintWriter }

import akka.actor._
import scala.concurrent._
import scala.concurrent.duration._

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.model.headers._
import akka.stream.ActorMaterializer
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import cisco.cache.cisco.cache.LruCache
import cisco.model._
import cisco.model.Stage._
import org.joda.time.DateTime
import spray.json._
import spray.json.DefaultJsonProtocol._

import cisco.Explorer._

object Server extends App {
  implicit val system: ActorSystem = ActorSystem()
  implicit val materializer: ActorMaterializer = ActorMaterializer()
  implicit val ec: ExecutionContext = system.dispatcher

  val START_TIMESTAMP = 1506610800000l
  val N_SIM_REQUESTS = 5
  val talks = Talk.loadTalks()
  def talksForTimestamp(ts: Long) = talks.map(_.filter(t => t.start.getMillis <= ts && t.end.getMillis > ts))
  talks.onComplete(_ => println("Talks loaded!"))

  case class TalkStatus(name: String, numAtendees: Long, timeSeries: List[Long])
  case class Status(accessPoints: Map[String, AccessPointStatus], talks: Map[Stage, TalkStatus])

  def talkStatus(talk: Talk): TalkStatus = {
    val timeseries = (talk.start.getMillis to talk.end.getMillis by 60000).toList.map(ms => new DateTime(ms)).sliding(2)
      .collect {
        case s :: e :: Nil => Explorer.getAccessPointStatus(s, e)
      }.map {
        _.filter { case (ap, _) => talk.location.aps.contains(ap) }.values.map {
          case AccessPointStatus(g, b, _) => g + b
        }.sum
      }.toList
    TalkStatus(
      talk.name,
      Explorer.getAccessPointStatus(talk.start, talk.end)
        .filter { case (ap, _) => talk.location.aps.contains(ap) }.values.map {
          case AccessPointStatus(g, b, _) => g + b
        }.sum,
      timeseries)
  }

  implicit val talkJF: RootJsonFormat[TalkStatus] = jsonFormat3(TalkStatus)
  implicit val statusJF: RootJsonFormat[Status] = jsonFormat2(Status)

  val statusCache = LruCache[Status]()
  val currentCache = LruCache[Status](1, 1, 5.seconds)

  def status(timestamp: Long): () => Future[Status] = { () =>
    println("Computing status for " + timestamp)
    val runningTalks = talksForTimestamp(timestamp).map(_.groupBy(_.location)
      .map { case (k, v) => k -> talkStatus(v.head) })

    runningTalks.map { rt =>
      val status = Status(Explorer.getAccessPointStatus(new DateTime(timestamp), new DateTime(timestamp + 3600000)), rt)
      val newFile = new File(s"api/$timestamp.json")
      val writer = new PrintWriter(newFile)
      writer.write(status.toJson.compactPrint)
      writer.close()
      status
    }
  }

  // system.actorOf(Props(new Actor {
  //   override def preStart() {
  //     self ! START_TIMESTAMP
  //   }

  //   def receive = {
  //     case ts: Long =>
  //       val curr = new DateTime().getMillis
  //       if (ts + 3600000 < curr) {
  //         val fs = (0 until N_SIM_REQUESTS).map { t =>
  //           if (ts + 3600000 * (t + 1) < curr)
  //             Some(statusCache(ts + 3600000 * t, status(ts + 3600000 * t)))
  //           else
  //             None
  //         }.flatten
  //         Future.sequence(fs).onComplete {
  //           case _ =>
  //             self ! (ts + 3600000 * fs.size)
  //         }
  //       } else {
  //         system.scheduler.scheduleOnce(1.minute, self, ts)
  //       }
  //   }
  // }))

  val route =
    path("api") {
      get {
        parameters('ts.as[Long].?) { timestamp =>
          respondWithHeader(`Access-Control-Allow-Origin`.`*`) {
            timestamp match {
              case Some(timestamp) =>
                complete(statusCache(timestamp, status(timestamp)))
              case None =>
                complete(currentCache(0, { () =>
                  for {
                    runningTalks <- talksForTimestamp(new DateTime().getMillis).map(_.groupBy(_.location)
                      .map { case (k, v) => k -> talkStatus(v.head) })
                    currentData <- Explorer.current()
                  } yield Status(currentData.mapValues {
                    case AccessPointStatus(g, b, r) =>
                      AccessPointStatus(g * 3, b * 3, r)
                  }.toMap, runningTalks)
                }))
            }
          }
        }
      }
    } ~ path("all") {
      get {
        respondWithHeader(`Access-Control-Allow-Origin`.`*`) {
          val curr = new DateTime().getMillis
          val currAligned = (curr / 3600000) * 3600000
          val fs = (START_TIMESTAMP until currAligned by 3600000).map { ts =>
            statusCache(ts, status(ts)).map { res => ts.toString -> res }
          }
          complete(Future.sequence(fs).map(_.toMap))
        }
      }
    } ~ getFromResourceDirectory("dist") ~ getFromResource("dist/index.html")

  val bindingFuture = Http().bindAndHandle(route, "0.0.0.0", 8080)
  bindingFuture.onComplete(_ => println("Server running on localhost:8080"))
}
