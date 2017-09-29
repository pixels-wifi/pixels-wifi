package cisco

import java.io.File

import scala.collection.mutable
import scala.io.Source

import com.github.nscala_time.time.Imports._
import spray.json._
import spray.json.DefaultJsonProtocol._

object Explorer {
  val DATA_DIR = "data"

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

  def getAccessPointStatus(start: DateTime, end: DateTime): Map[String, AccessPointStatus] = {
    val files = Explorer.getFiles(start, end)
    val m = mutable.Map[String, AccessPointStatus]()
    files.foreach { file =>
      try {
        val json = Source.fromFile(DATA_DIR + "/" + file).getLines.mkString.parseJson
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
        }.mapValues { case (g, b, r) => (g.size, b.size, r.sum / (g.size + b.size)) }
        data.foreach {
          case (k, (g, b, r)) =>
            m.update(k, {
              val curr = m.getOrElse(k, AccessPointStatus(0, 0, 0))
              curr.copy(goodUsers = curr.goodUsers + g, badUsers = curr.badUsers + b, avgRssi = curr.avgRssi + r)
            })
        }
      } catch {
        case _: Exception =>
          println(s"Failed to parse ${file}")
      }
    }
    m.mapValues {
      case AccessPointStatus(g, b, r) =>
        AccessPointStatus(g / files.size, b / files.size, r / files.size)
    }.toMap
  }
}
