import { useState } from 'react';
import { Schedule, Member } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronLeft, ChevronRight, Plus, Clock, User, StickyNote } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ScheduleViewProps {
  schedules: Schedule[];
  members: Member[];
  onAddSchedule: (schedule: Omit<Schedule, 'id'>) => void;
}

export function ScheduleView({ schedules, members, onAddSchedule }: ScheduleViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    memberId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
    reminder: '',
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter(s => s.date === dateStr);
  };

  const getDaySchedules = (date: Date) => {
    return getSchedulesForDate(date).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleAddSchedule = () => {
    const member = members.find(m => m.id === newSchedule.memberId);
    if (!member) return;

    onAddSchedule({
      ...newSchedule,
      memberName: member.name,
    });

    setIsAddDialogOpen(false);
    setNewSchedule({
      memberId: '',
      date: '',
      startTime: '',
      endTime: '',
      notes: '',
      reminder: '',
    });
  };

  const openAddDialog = (date?: Date) => {
    if (date) {
      setNewSchedule({
        ...newSchedule,
        date: format(date, 'yyyy-MM-dd'),
      });
    }
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">스케줄</h2>
          <p className="text-sm text-gray-500 mt-0.5">{format(currentDate, 'yyyy년 M월', { locale: ko })}</p>
        </div>
        <Button onClick={() => openAddDialog()} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          추가
        </Button>
      </div>

      <div className="space-y-4">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{format(currentDate, 'yyyy년 M월', { locale: ko })}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  오늘
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Calendar days */}
              {daysInMonth.map((day) => {
                const daySchedules = getDaySchedules(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square p-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : isCurrentDay
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm ${!isSameMonth(day, currentDate) ? 'text-gray-400' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {daySchedules.length > 0 && (
                        <div className="mt-auto">
                          <div className={`text-xs ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                            {daySchedules.length}건
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'M월 d일 (E)', { locale: ko }) : '날짜를 선택하세요'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-3">
                {getDaySchedules(selectedDate).map((schedule) => (
                  <div key={schedule.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                      <User className="w-4 h-4" />
                      <span>{schedule.memberName}</span>
                    </div>
                    {schedule.notes && (
                      <p className="text-sm text-gray-600 mt-2">{schedule.notes}</p>
                    )}
                    {schedule.reminder && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                        <div className="flex items-start gap-2">
                          <StickyNote className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-700">{schedule.reminder}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {getDaySchedules(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>예정된 일정이 없습니다</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => openAddDialog(selectedDate)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      일정 추가
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                캘린더에서 날짜를 선택하세요
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Schedule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>새 일정 추가</DialogTitle>
            <DialogDescription>회원의 PT 일정을 추가하세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member">회원 선택 *</Label>
              <Select value={newSchedule.memberId} onValueChange={(value) => setNewSchedule({ ...newSchedule, memberId: value })}>
                <SelectTrigger id="member">
                  <SelectValue placeholder="회원을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.remainingSessions}회 남음)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">날짜 *</Label>
              <Input
                id="date"
                type="date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">시작 시간 *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endTime">종료 시간 *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                value={newSchedule.notes}
                onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                placeholder="운동 계획, 특이사항 등"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="reminder">리마인더</Label>
              <Textarea
                id="reminder"
                value={newSchedule.reminder}
                onChange={(e) => setNewSchedule({ ...newSchedule, reminder: e.target.value })}
                placeholder="세션 전 확인할 사항"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button
                onClick={handleAddSchedule}
                disabled={!newSchedule.memberId || !newSchedule.date || !newSchedule.startTime || !newSchedule.endTime}
              >
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}