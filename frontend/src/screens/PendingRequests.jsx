import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPendingRequests, respondToRequest } from "../services/friendApi";


export function PendingRequests({ currentUser }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const loadRequest = () => {
        setLoading(true);
        getPendingRequests(currentUser.id)
        .then((data) => setRequests(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
        console.log(currentUser.id);
    };

    useEffect(() => {
        loadRequest();
    },[currentUser.id])

    const handleRespond = async (requestId, accept) => {
    try {
        await respondToRequest(requestId, accept);
        setMessage(accept ? 'Request Accept' : 'Request Reject');
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
        setMessage('Failed to respond')
    }
};
return (
    <div className="flex justify-center items-center min-h-screen bg-[#030712] p-6">
      {/* Tablet Container Matching Same Dimensions, Border & Theme */}
      <div className="w-full max-w-xl h-[600px] bg-[#0b1329] border border-[#1d293d] rounded-2xl p-6 shadow-2xl text-gray-100 font-sans flex flex-col">
        
        {/* Header Row */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/friends')}
            className="text-gray-400 hover:text-white text-sm font-medium transition cursor-pointer"
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold text-white tracking-tight">Pending Requests</h2>
        </div>
  
        {/* Status Message */}
        {message && (
          <p className="mb-4 text-sm text-center text-gray-300 bg-[#131d36] border border-[#1d293d] p-3 rounded-xl">
            {message}
          </p>
        )}
  
        {/* Loading State */}
        {loading && <p className="text-gray-400 text-sm">Loading...</p>}
  
        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <p className="text-gray-400 text-sm">No pending requests</p>
        )}
  
        {/* Requests List */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex justify-between items-center px-4 py-3 rounded-xl bg-[#131d36] border border-[#1d293d]"
            >
              <span className="text-sm font-medium text-gray-200">{req.senderUsername}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(req.id, true)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 transition text-white cursor-pointer"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRespond(req.id, false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-700 hover:bg-red-600 transition text-white cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
  
      </div>
    </div>
  );
    }

    export default PendingRequests;