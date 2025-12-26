import { useState } from 'react';
import { Member } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Phone, Mail, Calendar, AlertCircle, Plus, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface MemberListProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (member: Member) => void;
}

export function MemberList({ members, onAddMember, onUpdateMember }: MemberListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    email: '',
    totalSessions: 10,
    notes: '',
  });

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.includes(searchQuery) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = () => {
    onAddMember({
      ...newMember,
      remainingSessions: newMember.totalSessions,
      registrationDate: new Date().toISOString().split('T')[0],
    });
    setIsAddDialogOpen(false);
    setNewMember({
      name: '',
      phone: '',
      email: '',
      totalSessions: 10,
      notes: '',
    });
  };

  const getSessionBadgeVariant = (remaining: number, total: number) => {
    const ratio = remaining / total;
    if (ratio <= 0.2) return 'destructive';
    if (ratio <= 0.5) return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">회원 관리</h2>
          <p className="text-sm text-gray-500 mt-0.5">총 {members.length}명</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          추가
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="이름, 전화번호 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Member Cards */}
      <div className="grid gap-3">
        {filteredMembers.map((member) => (
          <Card 
            key={member.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedMember(member)}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={member.profileImage} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <Badge variant={getSessionBadgeVariant(member.remainingSessions, member.totalSessions)}>
                  {member.remainingSessions}/{member.totalSessions} 회 남음
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>등록일: {member.registrationDate}</span>
              </div>
              {member.notes && (
                <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{member.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>회원 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedMember.profileImage} alt={selectedMember.name} />
                  <AvatarFallback className="text-2xl">{selectedMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-semibold">{selectedMember.name}</h3>
                  <Badge variant={getSessionBadgeVariant(selectedMember.remainingSessions, selectedMember.totalSessions)} className="mt-2">
                    잔여 횟수: {selectedMember.remainingSessions}/{selectedMember.totalSessions}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label>전화번호</Label>
                  <p className="text-gray-900 mt-1">{selectedMember.phone}</p>
                </div>
                <div>
                  <Label>이메일</Label>
                  <p className="text-gray-900 mt-1">{selectedMember.email}</p>
                </div>
                <div>
                  <Label>등록일</Label>
                  <p className="text-gray-900 mt-1">{selectedMember.registrationDate}</p>
                </div>
                <div>
                  <Label>특이사항</Label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {selectedMember.notes || '없음'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedMember(null)}>
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 회원 추가</DialogTitle>
            <DialogDescription>새로운 회원을 추가하세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="홍길동"
              />
            </div>
            <div>
              <Label htmlFor="phone">전화번호 *</Label>
              <Input
                id="phone"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                placeholder="010-1234-5678"
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <Label htmlFor="sessions">PT 횟수</Label>
              <Input
                id="sessions"
                type="number"
                value={newMember.totalSessions}
                onChange={(e) => setNewMember({ ...newMember, totalSessions: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="notes">특이사항</Label>
              <Textarea
                id="notes"
                value={newMember.notes}
                onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                placeholder="건강상 주의사항, 목표 등을 입력하세요"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button 
                onClick={handleAddMember}
                disabled={!newMember.name || !newMember.phone}
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