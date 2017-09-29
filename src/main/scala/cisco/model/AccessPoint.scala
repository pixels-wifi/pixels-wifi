package cisco.model

import cisco.Explorer._

object AccessPoint {
  lazy val list = List(
    "AP_MainEvent_1",
    "AP_MainEvent_2",
    "AP_MainEvent_3",
    "AP_MainEvent_4",
    "AP_MainEvent_5",
    "AP_MainEvent_6",
    "AP_MainEvent_7",
    "AP_MainEvent_8",
    "AP_MainEvent_9",
    "AP_MainEvent_10",
    "AP_Stage2_1",
    "AP_Stage2_2",
    "AP_Stage3_1",
    "AP_Stage3_2",
    "AP_Stage4_1",
    "AP_Stage4_2",
    "AP_Esplanada",
    "AP_Workshop",
    "AP_Producao",
    "AP_Entrada",
    "AP_Zona_Passagem",
    "AP_Betai")

  lazy val empty = list.map { k =>
    k -> AccessPointStatus(0, 0, 0)
  }
}
