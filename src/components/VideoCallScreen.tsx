import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { motion } from 'framer-motion';
import { PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';

const VideoCallScreen: React.FC = () => {
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    const localVideoRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className="flex h-screen bg-gray-900 text-white p-4 gap-4">
            <div className="w-full flex flex-col gap-4">
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
        </div>
    );
};

export default VideoCallScreen;