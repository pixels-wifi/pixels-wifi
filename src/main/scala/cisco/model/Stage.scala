package cisco.model

import spray.json._

//FIXME check AP names
sealed trait Stage {
  val name: String
  val talkStage: Boolean = true
  val aps: List[String]
}
case object BrightPixel extends Stage {
  val name = "Bright Pixel Stage"
  val aps = List("AP_Stage3_1", "AP_Stage3_2")
}
case object BetaI extends Stage {
  val name = "Beta-i Stage"
  val aps = List("AP_Stage3_1", "AP_Stage3_2")
}
case object Nos extends Stage {
  val name = "NOS Stage"
  val aps = List("AP_Stage3_1", "AP_Stage3_2")
}
case object Segfault extends Stage {
  val name = "Segfault Stage"
  val aps = List("AP_Stage3_1", "AP_Stage3_2")
}
case object Workshops extends Stage {
  val name = "Workshops"
  val aps = List("AP_Stage3_1", "AP_Stage3_2")
}
case class Other(name: String) extends Stage {
  override val talkStage = false
  val aps = List.empty
}

object Stage {
  implicit val stageJsonFormat: JsonFormat[Stage] = new JsonFormat[Stage] {
    override def write(obj: Stage) = JsString(obj.name)

    override def read(json: JsValue) = json match {
      case JsString(BrightPixel.name) => BrightPixel
      case JsString(BetaI.name) => BetaI
      case JsString(Nos.name) => Nos
      case JsString(Segfault.name) => Segfault
      case JsString(Workshops.name) => Workshops
      case JsString(other) => Other(other)
      case x => throw DeserializationException("Failed to deserialize stage: " + x)
    }
  }
}
