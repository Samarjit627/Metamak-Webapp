// DraftOverlay.tsx
import React, { useState } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { DraftIssue } from "./draftAngleChecker";

interface Props {
  issues: DraftIssue[];
  onAccept: (accepted: DraftIssue[]) => void;
  onReject: (rejected: DraftIssue[], reason: string, userRole: string) => void;
}

const DraftOverlay: React.FC<Props> = ({ issues, onAccept, onReject }) => {
  const [status, setStatus] = useState<Record<number, boolean>>({});
  const [showRejectionReason, setShowRejectionReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userRole, setUserRole] = useState("Designer");

  const toggleIssue = (i: number) => {
    setStatus(prev => ({ ...prev, [i]: !prev[i] }));
  };

  const colorForConfidence = (score: number) =>
    score > 0.85 ? "green" : score > 0.6 ? "yellow" : "red";

  const handleAccept = () => {
    const accepted = issues.filter((_, i) => status[i] !== false);
    onAccept(accepted);
  };

  const handleReject = () => {
    setShowRejectionReason(true);
  };

  const handleFinalReject = () => {
    const rejected = issues.filter((_, i) => status[i] !== true);
    onReject(rejected, rejectionReason, userRole);
    setShowRejectionReason(false);
    setRejectionReason("");
  };

  return (
    <>
      {issues.map((issue, i) => (
        <mesh
          key={`draft-issue-${i}`}
          position={issue.center}
          onClick={() => toggleIssue(i)}
        >
          <boxGeometry args={[8, 8, 1]} />
          <meshStandardMaterial
            transparent
            opacity={0.5}
            color={status[i] === false ? "gray" : colorForConfidence(issue.confidenceScore)}
          />
          <Html position={[0, 6, 0]}>
            <div className="bg-white text-black p-2 rounded shadow-md text-xs">
              <b>Draft Angle Issue</b><br />
              Draft angle: {issue.draftAngle.toFixed(2)}°<br />
              Min required: 1.0°
            </div>
          </Html>
        </mesh>
      ))}

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-50">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg"
          onClick={handleAccept}
        >
          ✅ Accept
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg"
          onClick={handleReject}
        >
          ❌ Reject
        </button>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectionReason && (
        <div className="absolute bottom-20 right-4 bg-white p-3 rounded shadow">
          <label className="block mb-1 text-xs">Why are you rejecting the draft suggestions?</label>
          <select
            className="border rounded p-1 text-sm"
            onChange={e => setRejectionReason(e.target.value)}
            value={rejectionReason}
          >
            <option value="">-- Select Reason --</option>
            <option value="Not manufacturable">Not manufacturable</option>
            <option value="Aesthetic concern">Aesthetic concern</option>
            <option value="Tolerance issue">Tolerance issue</option>
            <option value="Other">Other</option>
          </select>
          <label className="block mt-2 mb-1 text-xs">Your role</label>
          <select
            onChange={e => setUserRole(e.target.value)}
            value={userRole}
            className="text-sm p-1"
          >
            <option value="Designer">Designer</option>
            <option value="Engineer">Engineer</option>
            <option value="Procurement">Procurement</option>
            <option value="Student">Student</option>
          </select>
          <button
            className="bg-red-600 text-white px-3 py-1 rounded ml-2"
            onClick={handleFinalReject}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
};

export default DraftOverlay;
