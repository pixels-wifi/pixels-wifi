package cisco.cache

/**
 * Copyright (C) 2009-2017 Lightbend Inc. <http://www.lightbend.com>
 */

import scala.concurrent.duration._

private[cache] class Timestamp private (val timestampNanos: Long) extends AnyVal {

  def +(period: Duration): Timestamp =
    if (isNever) this
    else if (!period.isFinite()) Timestamp.never
    else new Timestamp(timestampNanos + period.toNanos)

  def -(other: Timestamp): Duration =
    if (isNever) Duration.Inf
    else if (other.isNever) Duration.MinusInf
    else (timestampNanos - other.timestampNanos).nanos

  def isPast: Boolean = System.nanoTime() >= timestampNanos
  def isPast(now: Timestamp): Boolean = now.timestampNanos >= timestampNanos
  def isFuture: Boolean = !isPast

  def isFinite: Boolean = timestampNanos < Long.MaxValue
  def isNever: Boolean = timestampNanos == Long.MaxValue
}

private[cache] object Timestamp {
  def now: Timestamp = new Timestamp(System.nanoTime())
  def never: Timestamp = new Timestamp(Long.MaxValue)

  implicit object Ordering extends Ordering[Timestamp] {
    def compare(x: Timestamp, y: Timestamp): Int = math.signum(x.timestampNanos - y.timestampNanos).toInt
  }
}
