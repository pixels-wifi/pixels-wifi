package cisco

import java.io.File

import scala.collection.mutable
import scala.io.Source

import com.github.nscala_time.time.Imports._
import spray.json._
import spray.json.DefaultJsonProtocol._

object Explorer {
  val DATA_DIR = "data"

  case class Entry(macAddress: String, status: String, currentApName: Option[String])
  implicit val entryFormat = jsonFormat3(Entry)

  def getFiles(start: DateTime, end: DateTime): Seq[String] = {
    val startTs = start.getMillis() / 1000
    val endTs = end.getMillis() / 1000
    val dir = new File(DATA_DIR)
    if (dir.exists() && dir.isDirectory())
      dir.listFiles().filter { v =>
        val vTs = v.getName.dropRight(5).toLong
        vTs >= startTs && vTs <= endTs
      }.map(_.getName()).toSeq
    else
      Seq.empty[String]
  }

  def getAverageUsersPerAp(start: DateTime, end: DateTime): Map[String, Long] = {
    val files = Explorer.getFiles(start, end)
    val m = mutable.Map[String, Long]()
    files.foreach { file =>
      val json = Source.fromFile(DATA_DIR + "/" + file).getLines.mkString.parseJson
      val entries = json match {
        case JsArray(v) => v.map(_.convertTo[Entry])
        case _ => Seq.empty
      }
      val data = entries.foldLeft(Map.empty[String, Set[String]]) {
        case (m, entry) =>
          if (entry.status == "GONE" || entry.currentApName.isEmpty)
            m
          else {
            m.updated(entry.currentApName.get, m.getOrElse(entry.currentApName.get, Set.empty) + entry.macAddress)
          }
      }.mapValues(_.size)
      data.foreach {
        case (k, v) =>
          m.update(k, m.getOrElse(k, 0l) + v)
      }
    }
    m.mapValues(_ / files.size).toMap
  }
}
