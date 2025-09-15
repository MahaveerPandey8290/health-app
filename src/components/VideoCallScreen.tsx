import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, Send } from 'lucide-react';

const VideoCallScreen: React.FC = () => {
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [userInput, setUserInput] = useState('');

    const localVideoRef = useRef<HTMLDivElement>(null);
    const aiAvatarVideoRef = useRef<HTMLDivElement>(null); // Placeholder for AI avatar video

    useEffect(() => {
        const init = async () => {
            try {
                const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                setLocalAudioTrack(audioTrack);
                setLocalVideoTrack(videoTrack);
            } catch (error) {
                console.error('Failed to get local tracks', error);
            }
        };
        init();

        return () => {
            localAudioTrack?.close();
            localVideoTrack?.close();
        };
    }, []);

    useEffect(() => {
        if (localVideoTrack && localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
        }
        return () => {
            localVideoTrack?.stop();
        }
    }, [localVideoTrack]);

    const toggleAudio = async () => {
        if (localAudioTrack) {
            await localAudioTrack.setMuted(!isAudioMuted);
            setIsAudioMuted(!isAudioMuted);
        }
    };

    const toggleVideo = async () => {
        if (localVideoTrack) {
            await localVideoTrack.setMuted(!isVideoMuted);
            setIsVideoMuted(!isVideoMuted);
        }
    };

    const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    const handleSendMessage = () => {
        console.log("User message:", userInput);
        // Here you would typically send the message to the AI and get a response
        setUserInput('');
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white p-4 gap-4">
            {/* User's Video */}
            <div className="w-1/2 flex flex-col gap-4">
                <div className="relative flex-grow rounded-lg overflow-hidden border-2 border-purple-500">
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md text-sm">You</div>
                    <div ref={localVideoRef} className="w-full h-full bg-black"></div>
                </div>
                <div className="flex items-center justify-center gap-4 p-4 bg-gray-800 rounded-full shadow-lg">
                    <motion.button onClick={toggleAudio} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`p-3 rounded-full ${isAudioMuted ? 'bg-red-500' : 'bg-gray-600'}`}>
                        {isAudioMuted ? <MicOff /> : <Mic />}
                    </motion.button>
                    <motion.button onClick={toggleVideo} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`p-3 rounded-full ${isVideoMuted ? 'bg-red-500' : 'bg-gray-600'}`}>
                        {isVideoMuted ? <VideoOff /> : <Video />}
                    </motion.button>
                </div>
            </div>

            {/* AI Avatar */}
            <div className="w-1/2 flex flex-col gap-4">
                <div className="relative flex-grow rounded-lg overflow-hidden border-2 border-gray-700">
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md text-sm">AI Avatar</div>
                    <div ref={aiAvatarVideoRef} className="w-full h-full bg-black"></div> {/* Placeholder for AI avatar video */}
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={handleUserInput}
                        placeholder="Talk to the AI..."
                        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <motion.button onClick={handleSendMessage} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-3 rounded-full bg-purple-500">
                        <Send />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallScreen;