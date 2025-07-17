'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTokenAuth } from '@/context/TokenAuthContext';
import { 
    isAdmin, 
    subjectService, 
    examAdminService, 
    questionService 
} from '@/lib/adminAgent';
import {
    Settings, BookOpen, FileText, Plus, Edit, Trash2, 
    ArrowLeft, ArrowRight, Save, X, AlertCircle,
    CheckCircle, Loader, Users, Database
} from 'lucide-react';

// États de navigation
const NAVIGATION_STATES = {
    SUBJECTS: 'subjects',
    EXAMS: 'exams', 
    QUESTIONS: 'questions'
};

export default function AdminPage() {
    const { user, loading: authLoading } = useTokenAuth();
    const router = useRouter();
    
    // États principaux
    const [currentView, setCurrentView] = useState(NAVIGATION_STATES.SUBJECTS);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    
    // États des données
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [questions, setQuestions] = useState([]);
    
    // États d'interface
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Vérification de l'accès admin
    useEffect(() => {
        if (!authLoading && user) {
            const userExternalId = user.external_id || user.id;
            if (!isAdmin(userExternalId)) {
                router.push('/dashboard'); // Rediriger vers le dashboard
                return;
            }
            
            // Charger les sujets initialement
            loadSubjects();
        }
    }, [user, authLoading, router]);

    // Fonctions de chargement des données
    const loadSubjects = async () => {
        try {
            setLoading(true);
            const data = await subjectService.getAll();
            setSubjects(data);
        } catch (err) {
            setError('Erreur lors du chargement des sujets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadExams = async (subjectId) => {
        try {
            setLoading(true);
            const data = await examAdminService.getBySubject(subjectId);
            setExams(data);
        } catch (err) {
            setError('Erreur lors du chargement des examens');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadQuestions = async (examId) => {
        try {
            setLoading(true);
            const data = await questionService.getByExam(examId);
            setQuestions(data);
        } catch (err) {
            setError('Erreur lors du chargement des questions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Navigation
    const goToExams = (subject) => {
        setSelectedSubject(subject);
        setCurrentView(NAVIGATION_STATES.EXAMS);
        loadExams(subject.id);
    };

    const goToQuestions = (exam) => {
        setSelectedExam(exam);
        setCurrentView(NAVIGATION_STATES.QUESTIONS);
        loadQuestions(exam.id);
    };

    const goBack = () => {
        if (currentView === NAVIGATION_STATES.QUESTIONS) {
            setCurrentView(NAVIGATION_STATES.EXAMS);
            setSelectedExam(null);
        } else if (currentView === NAVIGATION_STATES.EXAMS) {
            setCurrentView(NAVIGATION_STATES.SUBJECTS);
            setSelectedSubject(null);
        }
    };

    // Vérification d'accès
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader className="mx-auto h-8 w-8 animate-spin text-green-600" />
                    <p className="mt-2 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
                    <h1 className="mt-4 text-xl font-semibold text-gray-900">Accès non autorisé</h1>
                    <p className="mt-2 text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
                </div>
            </div>
        );
    }

    const userExternalId = user.external_id || user.id;
    if (!isAdmin(userExternalId)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
                    <h1 className="mt-4 text-xl font-semibold text-gray-900">Accès refusé</h1>
                    <p className="mt-2 text-gray-600">
                        Vous n'avez pas les permissions nécessaires pour accéder à l'administration.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Settings className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
                                <p className="text-gray-600">Gestion des sujets, examens et questions</p>
                            </div>
                        </div>
                        
                        {/* Breadcrumb Navigation */}
                        <div className="flex items-center space-x-2 text-sm">
                            <span 
                                className={`cursor-pointer ${currentView === NAVIGATION_STATES.SUBJECTS ? 'font-semibold text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => {
                                    setCurrentView(NAVIGATION_STATES.SUBJECTS);
                                    setSelectedSubject(null);
                                    setSelectedExam(null);
                                }}
                            >
                                Sujets
                            </span>
                            {selectedSubject && (
                                <>
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                    <span 
                                        className={`cursor-pointer ${currentView === NAVIGATION_STATES.EXAMS ? 'font-semibold text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => {
                                            setCurrentView(NAVIGATION_STATES.EXAMS);
                                            setSelectedExam(null);
                                        }}
                                    >
                                        {selectedSubject.name}
                                    </span>
                                </>
                            )}
                            {selectedExam && (
                                <>
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                    <span className="font-semibold text-green-600">
                                        {selectedExam.title}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-red-800">{error}</span>
                            <button 
                                onClick={() => setError(null)}
                                className="ml-auto text-red-600 hover:text-red-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Contenu principal */}
                <div className="bg-white rounded-lg shadow-sm">
                    {currentView === NAVIGATION_STATES.SUBJECTS && (
                        <SubjectsView 
                            subjects={subjects}
                            loading={loading}
                            onSelectSubject={goToExams}
                            onAddSubject={() => setShowForm(true)}
                            onEditSubject={setEditingItem}
                            onDeleteSubject={async (id) => {
                                try {
                                    await subjectService.delete(id);
                                    loadSubjects();
                                } catch (err) {
                                    setError('Erreur lors de la suppression');
                                }
                            }}
                        />
                    )}

                    {currentView === NAVIGATION_STATES.EXAMS && (
                        <ExamsView 
                            exams={exams}
                            subject={selectedSubject}
                            loading={loading}
                            onSelectExam={goToQuestions}
                            onBack={goBack}
                            onAddExam={() => setShowForm(true)}
                            onEditExam={setEditingItem}
                            onDeleteExam={async (id) => {
                                try {
                                    await examAdminService.delete(id);
                                    loadExams(selectedSubject.id);
                                } catch (err) {
                                    setError('Erreur lors de la suppression');
                                }
                            }}
                        />
                    )}

                    {currentView === NAVIGATION_STATES.QUESTIONS && (
                        <QuestionsView 
                            questions={questions}
                            exam={selectedExam}
                            loading={loading}
                            onBack={goBack}
                            onAddQuestion={() => setShowForm(true)}
                            onEditQuestion={setEditingItem}
                            onDeleteQuestion={async (id) => {
                                try {
                                    await questionService.delete(id);
                                    loadQuestions(selectedExam.id);
                                } catch (err) {
                                    setError('Erreur lors de la suppression');
                                }
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Modales et formulaires */}
            {showForm && (
                <FormModal 
                    type={currentView}
                    item={editingItem}
                    subject={selectedSubject}
                    exam={selectedExam}
                    onClose={() => {
                        setShowForm(false);
                        setEditingItem(null);
                    }}
                    onSave={async (data) => {
                        try {
                            if (currentView === NAVIGATION_STATES.SUBJECTS) {
                                if (editingItem) {
                                    await subjectService.update(editingItem.id, data);
                                } else {
                                    await subjectService.create(data);
                                }
                                loadSubjects();
                            } else if (currentView === NAVIGATION_STATES.EXAMS) {
                                const examData = { ...data, subject_id: selectedSubject.id };
                                if (editingItem) {
                                    await examAdminService.update(editingItem.id, examData);
                                } else {
                                    await examAdminService.create(examData);
                                }
                                loadExams(selectedSubject.id);
                            } else if (currentView === NAVIGATION_STATES.QUESTIONS) {
                                const questionData = { ...data, exam_id: selectedExam.id };
                                if (editingItem) {
                                    await questionService.update(editingItem.id, questionData);
                                } else {
                                    await questionService.create(questionData);
                                }
                                loadQuestions(selectedExam.id);
                            }
                            setShowForm(false);
                            setEditingItem(null);
                        } catch (err) {
                            setError('Erreur lors de la sauvegarde');
                        }
                    }}
                />
            )}
        </div>
    );
}

// Composants des vues (à définir séparément)
function SubjectsView({ subjects, loading, onSelectSubject, onAddSubject, onEditSubject, onDeleteSubject }) {
    if (loading) {
        return (
            <div className="p-8 text-center">
                <Loader className="mx-auto h-8 w-8 animate-spin text-green-600" />
                <p className="mt-2 text-gray-600">Chargement des sujets...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <h2 className="text-lg font-semibold">Gestion des Sujets</h2>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                        {subjects.length}
                    </span>
                </div>
                <button
                    onClick={onAddSubject}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nouveau Sujet</span>
                </button>
            </div>

            {subjects.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun sujet</h3>
                    <p className="mt-2 text-gray-500">Commencez par créer votre premier sujet.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject) => (
                        <div key={subject.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 cursor-pointer" onClick={() => onSelectSubject(subject)}>
                                    <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                                    <p className="text-sm text-gray-500">{subject.code}</p>
                                    {subject.description && (
                                        <p className="text-sm text-gray-600 mt-2">{subject.description}</p>
                                    )}
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => onEditSubject(subject)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteSubject(subject.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ExamsView({ exams, subject, loading, onSelectExam, onBack, onAddExam, onEditExam, onDeleteExam }) {
    if (loading) {
        return (
            <div className="p-8 text-center">
                <Loader className="mx-auto h-8 w-8 animate-spin text-green-600" />
                <p className="mt-2 text-gray-600">Chargement des examens...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <h2 className="text-lg font-semibold">Examens - {subject?.name}</h2>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                            {exams.length}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onAddExam}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nouvel Examen</span>
                </button>
            </div>

            {exams.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun examen</h3>
                    <p className="mt-2 text-gray-500">Créez le premier examen pour ce sujet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {exams.map((exam) => (
                        <div key={exam.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 cursor-pointer" onClick={() => onSelectExam(exam)}>
                                    <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        Durée: {exam.duration || 'Non définie'} | 
                                        Statut: {exam.status || 'brouillon'}
                                    </p>
                                    {exam.description && (
                                        <p className="text-sm text-gray-600 mt-2">{exam.description}</p>
                                    )}
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => onEditExam(exam)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteExam(exam.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function QuestionsView({ questions, exam, loading, onBack, onAddQuestion, onEditQuestion, onDeleteQuestion }) {
    if (loading) {
        return (
            <div className="p-8 text-center">
                <Loader className="mx-auto h-8 w-8 animate-spin text-green-600" />
                <p className="mt-2 text-gray-600">Chargement des questions...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-2">
                        <Database className="h-5 w-5 text-green-600" />
                        <h2 className="text-lg font-semibold">Questions - {exam?.title}</h2>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                            {questions.length}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onAddQuestion}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nouvelle Question</span>
                </button>
            </div>

            {questions.length === 0 ? (
                <div className="text-center py-12">
                    <Database className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune question</h3>
                    <p className="mt-2 text-gray-500">Ajoutez des questions à cet examen.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((question, index) => (
                        <div key={question.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                            Q{index + 1}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {question.type || 'QCM'} | {question.points || 1} pts
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-2">{question.question_text}</h4>
                                    {question.options && (
                                        <div className="text-sm text-gray-600">
                                            Options: {JSON.parse(question.options || '[]').join(', ')}
                                        </div>
                                    )}
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => onEditQuestion(question)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteQuestion(question.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Composant de modal pour les formulaires
function FormModal({ type, item, subject, exam, onClose, onSave }) {
    const [formData, setFormData] = useState(() => {
        if (item) {
            return { ...item };
        }
        
        // Données par défaut selon le type
        switch (type) {
            case NAVIGATION_STATES.SUBJECTS:
                return { name: '', code: '', description: '' };
            case NAVIGATION_STATES.EXAMS:
                return { title: '', description: '', duration: '02:00:00', status: 'draft' };
            case NAVIGATION_STATES.QUESTIONS:
                return { 
                    question_text: '', 
                    type: 'multiple_choice', 
                    options: '[]', 
                    correct_answer: '', 
                    points: 1 
                };
            default:
                return {};
        }
    });

    const [options, setOptions] = useState(() => {
        if (type === NAVIGATION_STATES.QUESTIONS && item?.options) {
            try {
                return JSON.parse(item.options);
            } catch {
                return [''];
            }
        }
        return [''];
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let dataToSave = { ...formData };
        
        // Traitement spécial pour les questions
        if (type === NAVIGATION_STATES.QUESTIONS) {
            dataToSave.options = JSON.stringify(options.filter(opt => opt.trim()));
        }
        
        onSave(dataToSave);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const removeOption = (index) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const getTitle = () => {
        const action = item ? 'Modifier' : 'Créer';
        switch (type) {
            case NAVIGATION_STATES.SUBJECTS:
                return `${action} un sujet`;
            case NAVIGATION_STATES.EXAMS:
                return `${action} un examen`;
            case NAVIGATION_STATES.QUESTIONS:
                return `${action} une question`;
            default:
                return action;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">{getTitle()}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {type === NAVIGATION_STATES.SUBJECTS && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom du sujet *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Code du sujet *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code || ''}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </>
                        )}

                        {type === NAVIGATION_STATES.EXAMS && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Titre de l'examen *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Durée (HH:MM:SS)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.duration || '02:00:00'}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        placeholder="02:00:00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Statut
                                    </label>
                                    <select
                                        value={formData.status || 'draft'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="draft">Brouillon</option>
                                        <option value="published">Publié</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </>
                        )}

                        {type === NAVIGATION_STATES.QUESTIONS && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Texte de la question *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.question_text || ''}
                                        onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type de question
                                    </label>
                                    <select
                                        value={formData.type || 'multiple_choice'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="multiple_choice">QCM</option>
                                        <option value="single_choice">Question unique</option>
                                        <option value="text">Texte libre</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.points || 1}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                
                                {(formData.type === 'multiple_choice' || formData.type === 'single_choice') && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Options de réponse
                                            </label>
                                            <div className="space-y-2">
                                                {options.map((option, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) => updateOption(index, e.target.value)}
                                                            placeholder={`Option ${index + 1}`}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                                        />
                                                        {options.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeOption(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={addOption}
                                                    className="text-green-600 hover:text-green-800 text-sm flex items-center space-x-1"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    <span>Ajouter une option</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Réponse correcte
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.correct_answer || ''}
                                                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                                                placeholder="Entrez la réponse correcte"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                            >
                                <Save className="h-4 w-4" />
                                <span>Sauvegarder</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}