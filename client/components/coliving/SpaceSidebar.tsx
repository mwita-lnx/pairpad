'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Room {
  id: string
  monthly_rent: number | null
}

interface SpaceSidebarProps {
  totalRent: number
  rooms: Room[]
  utilitiesIncluded: boolean
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  membersCount: number
  averageRating: number | null
  isOwner: boolean
  requestingMatch: boolean
  onRequestMatch: () => void
  onAddRoom: () => void
  onImageManager: () => void
}

export default function SpaceSidebar({
  totalRent,
  rooms,
  utilitiesIncluded,
  totalRooms,
  availableRooms,
  occupiedRooms,
  membersCount,
  averageRating,
  isOwner,
  requestingMatch,
  onRequestMatch,
  onAddRoom,
  onImageManager
}: SpaceSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Rent Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Rent Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Space Rent:</span>
              <span className="font-bold text-[#ff5a5f] text-xl">${totalRent}</span>
            </div>
            {rooms.length > 0 && (
              <>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-700 mb-2">Individual Rooms:</p>
                  {rooms.filter(r => r.monthly_rent).map((room) => (
                    <div key={room.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">Room:</span>
                      <span className="text-gray-800 font-medium">${room.monthly_rent}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total from Rooms:</span>
                    <span className="font-medium text-gray-800">
                      ${rooms.reduce((sum, room) => sum + (room.monthly_rent || 0), 0)}
                    </span>
                  </div>
                </div>
              </>
            )}
            <div className="text-xs text-gray-700">
              {utilitiesIncluded ? 'Utilities included' : 'Utilities separate'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Space Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Space Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Rooms:</span>
              <span className="font-medium text-gray-800">{totalRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Available:</span>
              <span className="font-medium text-green-600">{availableRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Occupied:</span>
              <span className="font-medium text-blue-600">{occupiedRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Members:</span>
              <span className="font-medium text-gray-800">{membersCount}</span>
            </div>
            {averageRating && (
              <div className="flex justify-between">
                <span className="text-gray-700">Rating:</span>
                <span className="font-medium text-gray-800">⭐ {averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact & Match Request */}
      {!isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Interested in this space?</CardTitle>
            <CardDescription>Connect with the host</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={onRequestMatch}
              disabled={requestingMatch}
              className="w-full bg-[#ff5a5f] hover:bg-[#e54146]"
            >
              {requestingMatch ? 'Sending...' : '💕 Request Match'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
            >
              📞 Contact Host
            </Button>
            <div className="text-xs text-gray-700 text-center">
              By requesting a match, you're expressing interest in living here
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={onAddRoom}
            >
              Add New Room
            </Button>
            <Button
              onClick={onImageManager}
              variant="outline"
              className="w-full"
            >
              Manage Images
            </Button>
            <Button
              variant="outline"
              className="w-full"
            >
              View Applications
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}