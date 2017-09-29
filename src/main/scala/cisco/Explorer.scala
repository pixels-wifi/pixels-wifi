package cisco

import akka.actor.ActorSystem
import akka.http.scaladsl.model.headers.{ Authorization, BasicHttpCredentials }
import akka.stream.ActorMaterializer
import akka.util.ByteString
import java.io.{ File, PrintWriter }
import java.nio.file.{ Paths, Files }

import scala.collection.mutable
import scala.concurrent._
import scala.io.Source

import akka.http.scaladsl.Http
import akka.http.scaladsl.model.HttpRequest
import com.github.nscala_time.time.Imports._
import spray.json._
import spray.json.DefaultJsonProtocol._

import cisco.model.AccessPoint

object Explorer {
  val DATA_DIR = "data"
  val DATA_CACHE = "data_cache"

  case class Entry(macAddress: String, status: String, currentApName: Option[String], rssi: Double)
  case class AccessPointStatus(goodUsers: Long, badUsers: Long, avgRssi: Double)
  implicit val entryFormat = jsonFormat4(Entry)
  implicit val apStatusFormat = jsonFormat3(AccessPointStatus)

  def getFiles(start: DateTime, end: DateTime): Seq[String] = {
    val startTs = start.getMillis() / 1000
    val endTs = end.getMillis() / 1000
    val dir = new File(DATA_DIR)
    if (dir.exists() && dir.isDirectory())
      dir.listFiles().filter { v =>
        v.getName().endsWith(".json") && {
          val vTs = v.getName.dropRight(5).toLong
          vTs >= startTs && vTs <= endTs
        }
      }.map(_.getName()).toSeq
    else
      Seq.empty[String]
  }

  def parseStrings(strs: Seq[String]): Map[String, AccessPointStatus] = {
    val mt = mutable.Map[String, (Set[String], Set[String], Double)]()
    strs.foreach { str =>
      try {
        val json = str.parseJson
        val entries = json match {
          case JsArray(v) => v.map(_.convertTo[Entry])
          case _ => Seq.empty
        }
        val data = entries.foldLeft(Map.empty[String, (Set[String], Set[String], Seq[Double])]) {
          case (m, entry) =>
            if (entry.status == "GONE" || entry.currentApName.isEmpty)
              m
            else if (entry.status == "VISITOR") {
              m.updated(entry.currentApName.get, {
                val curr = m.getOrElse(entry.currentApName.get, (Set.empty[String], Set.empty[String], Seq.empty[Double]))
                (curr._1 + entry.macAddress, curr._2, curr._3 :+ entry.rssi)
              })
            } else {
              m.updated(entry.currentApName.get, {
                val curr = m.getOrElse(entry.currentApName.get, (Set.empty[String], Set.empty[String], Seq.empty[Double]))
                (curr._1, curr._2 + entry.macAddress, curr._3 :+ entry.rssi)
              })
            }
        }.mapValues { case (g, b, r) => (g, b, r.sum / (g.size + b.size)) }
        data.foreach {
          case (k, (g, b, r)) =>
            mt.update(k, {
              val curr = mt.getOrElse(k, (Set.empty[String], Set.empty[String], 0.0))
              (curr._1 ++ g, curr._2 ++ b, curr._3 + r)
            })
        }
      } catch {
        case _: Exception =>
          println("Failed to parse JSON")
      }
    }
    (AccessPoint.empty ++ mt.mapValues {
      case (g, b, r) =>
        AccessPointStatus(g.size, b.diff(g).size, r / strs.size)
    }.toMap).filter { case (k, _) => AccessPoint.list.contains(k) }.toMap
  }

  def getAccessPointStatus(start: DateTime, end: DateTime): Map[String, AccessPointStatus] = {
    val startTs = start.getMillis
    val endTs = end.getMillis
    val filename = s"$DATA_CACHE/$startTs-$endTs.json"
    if (Files.exists(Paths.get(filename)))
      Source.fromFile(filename).getLines.mkString.parseJson.convertTo[Map[String, AccessPointStatus]]
    else {
      val files = Explorer.getFiles(start, end)
      val res = parseStrings(files.map(file => Source.fromFile(DATA_DIR + "/" + file).getLines.mkString))
      val writer = new PrintWriter(new File(filename))
      writer.write(res.toJson.compactPrint)
      writer.close()
      res
    }
  }

  def current()(implicit system: ActorSystem, ec: ExecutionContext, mat: ActorMaterializer): Future[Map[String, AccessPointStatus]] =
    Http().singleRequest(
      HttpRequest(uri = "https://53cdgr.cmxcisco.com/api/presence/v1/clients?siteId=1505913182364")
        .addHeader(Authorization(BasicHttpCredentials("cGl4ZWxzY2FtcEBjaXNjby5jb206cGl4ZWxzY2FtcDIwMTc=")))).flatMap { res =>
        val str = res.entity.dataBytes.runFold(ByteString(""))(_ ++ _).map(_.utf8String)
        str.map { s => parseStrings(Seq(s)) }
      }
}
