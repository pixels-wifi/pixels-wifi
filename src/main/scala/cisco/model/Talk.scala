package cisco.model

import scala.concurrent.{ ExecutionContext, Future }

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.HttpRequest
import akka.stream.ActorMaterializer
import akka.util.ByteString
import org.joda.time.DateTime
import org.joda.time.format.{ DateTimeFormat, DateTimeFormatter }
import spray.json._
import spray.json.DefaultJsonProtocol._

case class Talk(name: String, location: Stage, start: DateTime, end: DateTime)

object Talk {

  case class CalendarTalk(SUMMARY: String, LOCATION: Stage, DTSTART: DateTime, DTEND: DateTime)

  def fromCalendarTalk(ct: CalendarTalk) = Talk(ct.SUMMARY, ct.LOCATION, ct.DTSTART, ct.DTEND)

  implicit val dateTimeJsonFormat: JsonFormat[DateTime] = new JsonFormat[DateTime] {
    val parser: DateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ssZ")

    override def write(obj: DateTime) = JsString(obj.toString)
    override def read(json: JsValue) = json match {
      case JsString(date) => DateTime.parse(date, parser)
      case x => throw DeserializationException("Failed to read date: " + x)
    }
  }
  implicit val talkJsonFormat: RootJsonFormat[Talk] = jsonFormat4(Talk.apply)
  implicit val calendarTalkJsonFormat: RootJsonFormat[CalendarTalk] = jsonFormat4(CalendarTalk)

  def loadTalks()(implicit system: ActorSystem, ec: ExecutionContext, mat: ActorMaterializer): Future[List[Talk]] = {
    Http().singleRequest(HttpRequest(uri = "https://api.pixels.camp/cal/json")).flatMap { res =>
      val json = res.entity.dataBytes.runFold(ByteString(""))(_ ++ _).map(_.utf8String.parseJson)
      json.map(_.asJsObject.fields("VCALENDAR").asJsObject.fields("VEVENT")
        .convertTo[List[CalendarTalk]]
        .map(fromCalendarTalk)
        .filter(_.location.talkStage)
      )
    }
  }
}
