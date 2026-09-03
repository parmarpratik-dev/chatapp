import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getZoneUsers } from '../services/locationApi';
import { BASE_URL } from '../config/config';

export default function CurrentUsersScreen({ currentUser, currentGeohash }) {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        if (!currentGeohash) return;
        getZoneUsers(currentGeohash, currentUser.id)
        .then((data) => setUsers(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, [currentGeohash]);


    return (
        <div className="flex justify-center items-center min-h-screen bg-[#030712] p-6">
      
          <div className="w-full max-w-xl min-h-[600px] bg-[#0b1329] border border-[#1d293d] rounded-2xl p-6 shadow-2xl text-gray-100 font-sans">
      
            {/* Back */}
            <div className="flex items-center mb-6">
              <Link
                to="/"
                className="text-gray-400 hover:text-white text-sm transition"
              >
                ← Back to Group
              </Link>
            </div>
      
            {/* Heading */}
            <h2 className="text-xl font-bold text-white tracking-tight mb-6">
              People Nearby
            </h2>
      
            {loading && (
              <p className="text-gray-400 text-sm">
                Loading...
              </p>
            )}
             
            {!loading && users.length === 0 && (
              <p className="text-gray-400 text-sm">
                No one else nearby right now.
              </p>
            )}
                
                <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
      
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => navigate(`/chat?receiverId=${user.id}`)}
                  className="text-left px-4 py-3 rounded-xl bg-[#172554] border border-[#1d293d] hover:bg-[#1e3a8a] transition text-sm font-medium text-gray-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    

                    {user.imgUrl ? 
                    (
                        <img src={`${BASE_URL}/${user.imgUrl}`} alt={user.imgUrl} className="w-10 h-10 rounded-full object-cover" />
                    )
                    : 
                    (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {user.username?.charAt(0).toUppercase()}
                    </div>
                    )
                    }
         
                    <span>
                      {user.username}
                    </span>
      
                  </div>
                </button>
              ))}
      
            </div>
      
          </div>
      
        </div>
      );
}