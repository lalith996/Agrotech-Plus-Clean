import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface RouteStop {
  sequence: number
  orderId: string
  address: string
  latitude: number | null
  longitude: number | null
  status: string
}

interface RouteMapProps {
  stops: RouteStop[]
  optimization?: {
    optimizedDistance: number
    estimatedTime: number
  } | null
}

export function RouteMap({ stops, optimization }: RouteMapProps) {
  return (
    <Card className="rounded-xl shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#00B207]" />
          Route Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Route visualization */}
          <div className="space-y-4">
            {stops.map((stop, index) => (
              <div key={stop.sequence} className="relative">
                {/* Connection line */}
                {index < stops.length - 1 && (
                  <div className="absolute left-4 top-10 w-0.5 h-12 bg-gray-300" />
                )}
                
                {/* Stop marker */}
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                    stop.status === 'DELIVERED'
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {stop.sequence}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-gray-900 text-sm">{stop.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Route summary */}
          {optimization && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Distance</p>
                  <p className="font-semibold text-gray-900">
                    {optimization.optimizedDistance.toFixed(1)} km
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Time</p>
                  <p className="font-semibold text-gray-900">
                    {optimization.estimatedTime} min
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
