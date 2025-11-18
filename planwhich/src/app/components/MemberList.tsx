import React, { useState } from 'react';
import { Search, Plus, MessageCircle, ChevronDown } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  role: 'Manager' | 'Member';
  avatar: string;
}

type RoleType = 'Manager' | 'Member';

const MemberList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberRole, setNewMemberRole] = useState<RoleType>('Member');

  const handleRoleChange = (memberId: number, newRole: RoleType): void => {
    setMembers(members.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));
    setOpenDropdown(null);
  };

  const handleAddMember = (): void => {
    if (newMemberName.trim()) {
      const avatarColors: string[] = [
        'bg-purple-600', 
        'bg-indigo-600', 
        'bg-blue-600', 
        'bg-pink-600', 
        'bg-teal-600', 
        'bg-green-600', 
        'bg-red-600', 
        'bg-yellow-600'
      ];
      const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
      
      const newMember: Member = {
        id: members.length + 1,
        name: newMemberName.trim(),
        role: newMemberRole,
        avatar: randomColor
      };
      
      setMembers([...members, newMember]);
      setNewMemberName('');
      setNewMemberRole('Member');
      setShowAddModal(false);
    }
  };

  const filteredMembers: Member[] = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 relative w-[400px] h-[288px] flex flex-col">
        {/* Header & Search (fixed area) */}
        <div className="flex-shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Members</h2>
            <button 
              className="p-1.5 bg-green-500 hover:bg-green-600 rounded-md transition-colors" 
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Scrollable Members List */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-md transition-colors group"
            >
              {/* Left Side: Avatar and Info */}
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-9 h-9 rounded-full ${member.avatar} flex items-center justify-center text-white font-medium text-sm`}>
                  {getInitials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                      className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <span>{member.role}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {openDropdown === member.id && (
                      <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => handleRoleChange(member.id, 'Manager')}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
                        >
                          Project Manager
                        </button>
                        <button
                          onClick={() => handleRoleChange(member.id, 'Member')}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
                        >
                          Member
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* No Results */}
          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500">
              No members found
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal (unchanged) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-grey bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter member name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Member">Member</option>
                  <option value="Manager">Project Manager</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewMemberName('');
                  setNewMemberRole('Member');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MemberList;
