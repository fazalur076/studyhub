import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Loader, BookOpen, Brain, Target } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        setLoading(false);

        if (error) {
            console.error('Login error:', error);
            setError(error.message);
        } else {
            navigate('/');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="mb-8 relative z-10 lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        StudyHub
                    </h1>
                </div>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                <div className="hidden lg:block space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                StudyHub
                            </h1>
                        </div>
                        <p className="text-xl text-slate-600 max-w-md">
                            Transform your study materials into interactive quizzes and get instant help from your AI tutor
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-1">AI-Generated Quizzes</h3>
                                <p className="text-sm text-slate-600">Test your knowledge with personalized questions</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-1">Smart AI Tutor</h3>
                                <p className="text-sm text-slate-600">Get instant answers to your questions</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-1">Track Your Progress</h3>
                                <p className="text-sm text-slate-600">Monitor your learning journey</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                                    <span className="text-white/90 text-sm font-medium">AI-Powered Learning</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
                                <p className="text-white/90">Sign in to continue your learning journey</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-red-600 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin h-5 w-5" />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-slate-500">New to StudyHub?</span>
                                </div>
                            </div>

                            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                                        </div>
                                        <h4 className="font-bold text-lg">Invite-Only Community</h4>
                                    </div>
                                    <p className="text-white/90 text-sm leading-relaxed">
                                        StudyHub is currently available through referrals only. Ask an existing member for an invite to join our exclusive learning community.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:hidden mt-8 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                StudyHub
                            </span>
                        </div>
                        <p className="text-sm text-slate-600">Transform your learning experience</p>
                    </div>
                </div>
            </div>
        </div>
    );
}