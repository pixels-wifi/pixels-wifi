import scalariform.formatter.preferences._

name := "camp-wifi-server"

organization := "cisco"

version := "0.1-SNAPSHOT"

scalaVersion := "2.12.3"

libraryDependencies ++= Seq(
  "com.typesafe.akka"      %% "akka-http"            % "10.0.10",
  "com.typesafe.akka"      %% "akka-http-spray-json" % "10.0.10",
  "com.typesafe.akka"      %% "akka-stream"          % "2.5.4",
  "com.typesafe.akka"      %% "akka-actor"           % "2.5.4",
  "com.github.nscala-time" %% "nscala-time"          % "2.16.0",
  "com.googlecode.concurrentlinkedhashmap" % "concurrentlinkedhashmap-lru" % "1.4.2",
  "io.spray"               %% "spray-json"           % "1.3.3")

scalacOptions ++= Seq(
  "-deprecation",
  "-unchecked",
  "-feature",
  "-language:implicitConversions") ++
  (CrossVersion.partialVersion(scalaVersion.value) match {
    case Some((2, major)) if major >= 11 => Seq("-Ywarn-unused-import")
    case _ => Seq()
   })

scalacOptions in (Compile, console) ~= (_ filterNot (_ == "-Ywarn-unused-import"))
scalacOptions in (Test, console) := (scalacOptions in (Compile, console)).value

scalariformSettings

ScalariformKeys.preferences := ScalariformKeys.preferences.value
  .setPreference(AlignParameters, true)
  .setPreference(DoubleIndentClassDeclaration, true)

enablePlugins(JavaAppPackaging)
dockerRepository := Some("pixelscamp.azurecr.io")
