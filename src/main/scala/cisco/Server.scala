package cisco

import scala.concurrent.ExecutionContext

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Directives._
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

  val route =
    path("api" / LongNumber) { timestamp =>
      get {
        complete(statusCache(timestamp, { () =>
          println("Computing status for " + timestamp)
          val runningTalks = talksForTimestamp(timestamp).map(_.groupBy(_.location)
            .map { case (k, v) => k -> talkStatus(v.head) })

          runningTalks.map(rt => Status(Explorer.getAccessPointStatus(new DateTime(timestamp), new DateTime(timestamp + 3600000)), rt))
        }))
      }
    }

  val bindingFuture = Http().bindAndHandle(route, "localhost", 8080)
  bindingFuture.onComplete(_ => println("Server running on localhost:8080"))
}
