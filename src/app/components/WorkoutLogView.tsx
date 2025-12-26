import { useState } from 'react';
import { WorkoutLog, WorkoutExercise, Member } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Camera, X, Search } from 'lucide-react';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WorkoutLogViewProps {
  workoutLogs: WorkoutLog[];
  members: Member[];
  onAddWorkoutLog: (log: Omit<WorkoutLog, 'id'>) => void;
}

export function WorkoutLogView({ workoutLogs, members, onAddWorkoutLog }: WorkoutLogViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newLog, setNewLog] = useState({
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    sessionNumber: 1,
    exercises: [] as WorkoutExercise[],
    overallNotes: '',
    reminderForNext: '',
    photos: [] as string[],
  });

  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: [{ setNumber: 1, reps: 0, weight: 0 }],
    notes: '',
  });

  const filteredLogs = workoutLogs.filter(log =>
    log.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.date.includes(searchQuery)
  );

  const handleAddExercise = () => {
    if (!currentExercise.name) return;

    setNewLog({
      ...newLog,
      exercises: [
        ...newLog.exercises,
        {
          ...currentExercise,
          id: `ex-${Date.now()}`,
        },
      ],
    });

    setCurrentExercise({
      name: '',
      sets: [{ setNumber: 1, reps: 0, weight: 0 }],
      notes: '',
    });
  };

  const handleAddSet = () => {
    setCurrentExercise({
      ...currentExercise,
      sets: [
        ...currentExercise.sets,
        {
          setNumber: currentExercise.sets.length + 1,
          reps: 0,
          weight: 0,
        },
      ],
    });
  };

  const handleRemoveSet = (index: number) => {
    setCurrentExercise({
      ...currentExercise,
      sets: currentExercise.sets.filter((_, i) => i !== index),
    });
  };

  const handleSetChange = (index: number, field: 'reps' | 'weight', value: number) => {
    const updatedSets = [...currentExercise.sets];
    updatedSets[index] = { ...updatedSets[index], [field]: value };
    setCurrentExercise({ ...currentExercise, sets: updatedSets });
  };

  const handleRemoveExercise = (index: number) => {
    setNewLog({
      ...newLog,
      exercises: newLog.exercises.filter((_, i) => i !== index),
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In a real app, you would upload these to a server
    // For demo purposes, we'll create object URLs
    const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
    setNewLog({
      ...newLog,
      photos: [...newLog.photos, ...newPhotos],
    });
  };

  const handleRemovePhoto = (index: number) => {
    setNewLog({
      ...newLog,
      photos: newLog.photos.filter((_, i) => i !== index),
    });
  };

  const handleSaveLog = () => {
    const member = members.find(m => m.id === newLog.memberId);
    if (!member) return;

    onAddWorkoutLog({
      ...newLog,
      memberName: member.name,
    });

    setIsAddDialogOpen(false);
    setNewLog({
      memberId: '',
      date: new Date().toISOString().split('T')[0],
      sessionNumber: 1,
      exercises: [],
      overallNotes: '',
      reminderForNext: '',
      photos: [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">운동 일지</h2>
          <p className="text-sm text-gray-500 mt-0.5">회원 운동 기록</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          작성
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="이름, 날짜 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Workout Logs */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card 
            key={log.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedLog(log)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{log.memberName}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{log.date}</Badge>
                    <Badge>세션 #{log.sessionNumber}</Badge>
                  </div>
                </div>
                {log.photos.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Camera className="w-3 h-3" />
                    {log.photos.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-sm">운동 종목:</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {log.exercises.map(e => e.name).join(', ')}
                  </span>
                </div>
                {log.overallNotes && (
                  <p className="text-sm text-gray-600">{log.overallNotes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>운동 일지가 없습니다</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsAddDialogOpen(true)}
            >
              첫 일지 작성하기
            </Button>
          </div>
        )}
      </div>

      {/* View Log Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLog?.memberName} - 운동 일지</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <Badge variant="outline">{selectedLog.date}</Badge>
                <Badge>세션 #{selectedLog.sessionNumber}</Badge>
              </div>

              <div>
                <h3 className="font-semibold mb-3">운동 내역</h3>
                <div className="space-y-4">
                  {selectedLog.exercises.map((exercise) => (
                    <div key={exercise.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">{exercise.name}</h4>
                      <div className="space-y-1">
                        {exercise.sets.map((set) => (
                          <div key={set.setNumber} className="text-sm text-gray-600">
                            {set.setNumber}세트: {set.reps}회 × {set.weight}kg
                          </div>
                        ))}
                      </div>
                      {exercise.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">💬 {exercise.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedLog.overallNotes && (
                <div>
                  <h3 className="font-semibold mb-2">총평</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedLog.overallNotes}</p>
                </div>
              )}

              {selectedLog.reminderForNext && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-semibold mb-2 text-amber-900">다음 세션 리마인더</h3>
                  <p className="text-amber-700">{selectedLog.reminderForNext}</p>
                </div>
              )}

              {selectedLog.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">사진</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLog.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`운동 사진 ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Workout Log Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>운동 일지 작성</DialogTitle>
            <DialogDescription>회원의 운동 일지를 작성하세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="log-member">회원 선택 *</Label>
                <Select value={newLog.memberId} onValueChange={(value) => setNewLog({ ...newLog, memberId: value })}>
                  <SelectTrigger id="log-member">
                    <SelectValue placeholder="회원을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="log-date">날짜 *</Label>
                <Input
                  id="log-date"
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="session-number">세션 번호</Label>
                <Input
                  id="session-number"
                  type="number"
                  value={newLog.sessionNumber}
                  onChange={(e) => setNewLog({ ...newLog, sessionNumber: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            {/* Exercises */}
            <div>
              <h3 className="font-semibold mb-3">운동 종목</h3>
              
              {/* Added exercises */}
              {newLog.exercises.length > 0 && (
                <div className="space-y-2 mb-4">
                  {newLog.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{exercise.name}</h4>
                        <p className="text-sm text-gray-600">
                          {exercise.sets.length}세트
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExercise(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new exercise */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-4">
                <div>
                  <Label htmlFor="exercise-name">운동 이름</Label>
                  <Input
                    id="exercise-name"
                    value={currentExercise.name}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                    placeholder="예: 스쿼트"
                  />
                </div>

                <div>
                  <Label>세트 정보</Label>
                  <div className="space-y-2 mt-2">
                    {currentExercise.sets.map((set, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-sm font-medium w-12">{set.setNumber}세트</span>
                        <Input
                          type="number"
                          placeholder="횟수"
                          value={set.reps || ''}
                          onChange={(e) => handleSetChange(index, 'reps', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span className="text-sm">회 ×</span>
                        <Input
                          type="number"
                          placeholder="무게"
                          value={set.weight || ''}
                          onChange={(e) => handleSetChange(index, 'weight', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span className="text-sm">kg</span>
                        {currentExercise.sets.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSet(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleAddSet}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    세트 추가
                  </Button>
                </div>

                <div>
                  <Label htmlFor="exercise-notes">메모</Label>
                  <Input
                    id="exercise-notes"
                    value={currentExercise.notes}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, notes: e.target.value })}
                    placeholder="자세, 느낌 등"
                  />
                </div>

                <Button onClick={handleAddExercise} disabled={!currentExercise.name}>
                  <Plus className="w-4 h-4 mr-2" />
                  운동 추가
                </Button>
              </div>
            </div>

            {/* Photos */}
            <div>
              <Label htmlFor="photos">사진 (필수)</Label>
              <div className="mt-2">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">사진을 업로드하려면 클릭하세요</p>
                  </div>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              {newLog.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {newLog.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`업로드 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="overall-notes">전체 총평</Label>
              <Textarea
                id="overall-notes"
                value={newLog.overallNotes}
                onChange={(e) => setNewLog({ ...newLog, overallNotes: e.target.value })}
                placeholder="오늘 세션 전체 평가, 회원 컨디션 등"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="reminder">다음 세션 리마인더</Label>
              <Textarea
                id="reminder"
                value={newLog.reminderForNext}
                onChange={(e) => setNewLog({ ...newLog, reminderForNext: e.target.value })}
                placeholder="다음 세션에 참고할 사항"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button
                onClick={handleSaveLog}
                disabled={!newLog.memberId || !newLog.date || newLog.exercises.length === 0 || newLog.photos.length === 0}
              >
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}