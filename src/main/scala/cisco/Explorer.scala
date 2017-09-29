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
    val mt = mutable.Map[String, (Set[String], Set[String], Double)]()
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
          println(s"Failed to parse ${file}")
      }
    }
    mt.mapValues {
      case (g, b, r) =>
        AccessPointStatus(g.size, b.diff(g).size, r / files.size)
    }.toMap
  }
}
