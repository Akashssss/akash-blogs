import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import { UserContext } from '../App';
import BlogEditor from '../components/blog-editor.component';
import PublishForm from '../components/publish-form.component';
import Loader from '../components/loader.component';

import { getLocalDraft, clearLocalDraft, hasMeaningfulDraft } from '../utils/draftManager';

const blogStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: '',
    author: { personal_info: {} }
};

export const EditorContext = createContext({});

export default function Editor() {
    const { blog_id } = useParams();
    const navigate = useNavigate();

    // userAuth can be undefined on the very first render, before the context
    // provider has read the session — destructuring it directly would throw.
    const { userAuth } = useContext(UserContext) || {};
    const access_token = userAuth?.access_token ?? null;

    const [isRestoredDraft, setIsRestoredDraft] = useState(false);
    const [blog, setBlog] = useState(() => {
        if (!blog_id) {
            const savedDraft = getLocalDraft(null);
            if (hasMeaningfulDraft(savedDraft)) {
                return { ...blogStructure, ...savedDraft };
            }
        }
        return blogStructure;
    });

    const [editorState, setEditorState] = useState('editor');
    const [textEditor, setTextEditor] = useState({ isReady: false });
    // Only an existing blog needs fetching; a brand new one is ready immediately.
    const [loading, setLoading] = useState(Boolean(blog_id));
    const [loadError, setLoadError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    const retry = useCallback(() => {
        setLoadError(null);
        setLoading(true);
        setReloadKey((n) => n + 1);
    }, []);

    const discardDraft = useCallback(() => {
        clearLocalDraft(blog_id);
        setIsRestoredDraft(false);
        if (!blog_id) {
            setBlog({ ...blogStructure });
        } else {
            setReloadKey((n) => n + 1);
        }
    }, [blog_id]);

    useEffect(() => {
        // New blog: restore draft if present, otherwise fresh structure
        if (!blog_id) {
            const savedDraft = getLocalDraft(null);
            if (hasMeaningfulDraft(savedDraft)) {
                setBlog({ ...blogStructure, ...savedDraft });
                setIsRestoredDraft(true);
            } else {
                setBlog(blogStructure);
                setIsRestoredDraft(false);
            }
            setLoadError(null);
            setLoading(false);
            return undefined;
        }

        // Editing a draft requires a token; the redirect below handles the UI.
        if (!access_token) {
            setLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        let cancelled = false;

        (async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`,
                    { blog_id, draft: true, mode: 'edit' },
                    {
                        signal: controller.signal,
                        headers: { Authorization: `Bearer ${access_token}` }
                    }
                );

                if (cancelled) return;

                if (!data?.blog) {
                    setBlog(null);
                    setLoadError('That blog could not be found.');
                } else {
                    const localDraft = getLocalDraft(blog_id);
                    if (localDraft && hasMeaningfulDraft(localDraft)) {
                        setBlog({ ...data.blog, ...localDraft });
                        setIsRestoredDraft(true);
                    } else {
                        setBlog(data.blog);
                        setIsRestoredDraft(false);
                    }
                }
            } catch (error) {
                if (cancelled || axios.isCancel?.(error) || error?.name === 'CanceledError') return;

                console.error('Error fetching blog for editor:', error);
                setBlog(null);
                setLoadError(
                    error?.response?.status === 403 || error?.response?.status === 401
                        ? 'You do not have permission to edit this blog.'
                        : error?.response?.data?.error || 'This blog could not be loaded. Check your connection and try again.'
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [blog_id, access_token, reloadKey]);

    // A fresh object every render re-renders every consumer of the editor
    // context, including the editor itself. Memoise it.
    const contextValue = useMemo(
        () => ({
            blog,
            setBlog,
            editorState,
            setEditorState,
            textEditor,
            setTextEditor,
            isRestoredDraft,
            setIsRestoredDraft,
            discardDraft
        }),
        [blog, editorState, textEditor, isRestoredDraft, discardDraft]
    );

    if (access_token === null) {
        return <Navigate to="/signin" replace />;
    }

    const renderBody = () => {
        if (loading) return <Loader />;

        // blog is null only when the fetch failed — rendering BlogEditor here
        // would crash on blog.title, so show a way out instead.
        if (loadError || !blog) {
            return (
                <section className="h-cover flex flex-col items-center justify-center gap-4 text-center px-4">
                    <h1 className="text-2xl font-gelasio">Couldn&apos;t open this blog</h1>
                    <p className="text-dark-grey max-w-md">{loadError || 'Something went wrong while loading the editor.'}</p>
                    <div className="flex items-center gap-3">
                        <button type="button" className="btn-dark" onClick={retry}>
                            Try again
                        </button>
                        <button type="button" className="btn-light" onClick={() => navigate('/dashboard/blogs')}>
                            Back to your blogs
                        </button>
                    </div>
                </section>
            );
        }

        return editorState === 'editor' ? <BlogEditor /> : <PublishForm />;
    };

    return <EditorContext.Provider value={contextValue}>{renderBody()}</EditorContext.Provider>;
}
