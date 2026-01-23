import { useEffect, useState } from 'react';
import { authFetch } from '../../utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
  });
  const [originalProfile, setOriginalProfile] = useState(profile);

  const token = localStorage.getItem('access_token');

  if (!token) {
    window.location.href = '/auth/login?role=teacher';
    return null;
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authFetch(`${BACKEND_URL}/user-profile/`);
        const profileData = {
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          bio: data.bio || '',
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await authFetch(`${BACKEND_URL}/user-profile/update/`, {
        method: 'PATCH',
        body: JSON.stringify(profile),
      });
      setOriginalProfile(profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Profile</h1>
        <p className="text-slate-600">Manage your account information</p>
      </div>

      <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Personal Information</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
              <input type="text" value={profile.first_name} onChange={(e) => updateProfile('first_name', e.target.value)}
                className={`w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${!isEditing ? 'bg-slate-50' : ''}`}
                readOnly={!isEditing}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
              <input type="text" value={profile.last_name} onChange={(e) => updateProfile('last_name', e.target.value)}
                className={`w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${!isEditing ? 'bg-slate-50' : ''}`}
                readOnly={!isEditing}/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input type="email" value={profile.email} onChange={(e) => updateProfile('email', e.target.value)}
              className={`w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${!isEditing ? 'bg-slate-50' : ''}`}
              readOnly={!isEditing}/>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
            <textarea value={profile.bio} onChange={(e) => updateProfile('bio', e.target.value)} rows={3}
              className={`w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${!isEditing ? 'bg-slate-50' : ''}`}
              readOnly={!isEditing}/>
          </div>

          <div className="flex gap-4">
            {!isEditing ? (
              <button onClick={handleEdit} className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700">
                Edit Profile
              </button>
              ) : (
                <>
                  <button onClick={handleSave} className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700">
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="rounded-xl bg-slate-600 px-6 py-3 text-white font-semibold hover:bg-slate-700">
                    Cancel
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}