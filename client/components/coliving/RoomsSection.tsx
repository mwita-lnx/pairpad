'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Room {
  id: string
  name: string
  room_type: 'bedroom' | 'shared_bedroom' | 'studio' | 'master_bedroom'
  description: string
  size_sqft: number | null
  has_private_bathroom: boolean
  has_balcony: boolean
  has_closet: boolean
  furnished: boolean
  air_conditioning: boolean
  is_available: boolean
  monthly_rent: number | null
  security_deposit: number | null
  available_from: string | null
  current_occupant: any
  images: any[]
  compatibility_score: number | null
}

interface RoomsSectionProps {
  rooms: Room[]
  availableRoomsCount: number
  isOwner: boolean
  onAddRoom: () => void
  onBookRoom: (room: Room) => void
}

export default function RoomsSection({
  rooms,
  availableRoomsCount,
  isOwner,
  onAddRoom,
  onBookRoom
}: RoomsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-[#484848]">Rooms ({rooms.length})</CardTitle>
            <CardDescription className="text-gray-700">{availableRoomsCount} available</CardDescription>
          </div>
          {isOwner && (
            <Button
              onClick={onAddRoom}
              className="bg-[#ff5a5f] hover:bg-[#e54146]"
            >
              Add Room
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-700 mb-4">No rooms added yet</p>
            {isOwner && (
              <Button onClick={onAddRoom}>
                Add Your First Room
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#484848] text-lg">{room.name}</h4>
                    <p className="text-sm text-gray-700 capitalize font-medium">{room.room_type.replace('_', ' ')}</p>
                    <div className="mt-2 space-y-1">
                      {room.size_sqft && (
                        <p className="text-sm text-gray-700">📏 {room.size_sqft} sq ft</p>
                      )}
                      {room.security_deposit && (
                        <p className="text-sm text-gray-700">💳 Security Deposit: ${room.security_deposit}</p>
                      )}
                      {room.available_from && (
                        <p className="text-sm text-gray-700">📅 Available from: {new Date(room.available_from).toLocaleDateString()}</p>
                      )}
                      {room.compatibility_score !== null && (
                        <p className="text-sm text-purple-600 font-medium">💕 Compatibility: {room.compatibility_score}%</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-[#ff5a5f] text-xl">${room.monthly_rent || 'TBD'}</p>
                    <p className="text-sm text-gray-700">per month</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs mb-2 font-medium ${
                      room.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {room.is_available ? 'Available' : 'Occupied'}
                    </span>
                    {!isOwner && room.is_available && (
                      <div className="mt-2">
                        <Button
                          onClick={() => onBookRoom(room)}
                          size="sm"
                          className="bg-[#ff5a5f] hover:bg-[#e54146] text-white"
                        >
                          Book Room
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {room.description && (
                  <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg">{room.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {room.has_private_bathroom && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">🚿 Private Bath</span>
                  )}
                  {room.has_balcony && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">🌿 Balcony</span>
                  )}
                  {room.has_closet && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">👕 Closet</span>
                  )}
                  {room.furnished && (
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">🛏️ Furnished</span>
                  )}
                  {room.air_conditioning && (
                    <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs font-medium">❄️ AC</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}