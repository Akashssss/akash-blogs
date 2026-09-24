import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDay } from '../common/date';
import { UserContext } from '../App';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit3, Eye, Heart, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const BlogStats = ({ stats = {} }) => {
    return (
        <div className="flex items-center gap-4 py-2 px-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                {(stats.total_reads || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                {(stats.total_likes || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                {(stats.total_comments || 0).toLocaleString()}
            </span>
        </div>
    );
};

export function ManagePublishedBlogCard({ blog }) {
    const { banner, blog_id, title, publishedAt, activity } = blog;
    const { userAuth: { access_token } } = useContext(UserContext);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const { index, setStateFunc } = blog;

        try {
            await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-blog`, { blog_id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            setIsDeleteDialogOpen(false);
            setStateFunc((prev) => {
                if (!prev) return null;
                const { deletedDocCount = 0, totalDocs = 0, results = [] } = prev;
                const newResults = results.filter((item) => item.blog_id !== blog_id);
                if (!newResults.length && totalDocs - 1 > 0) {
                    return null;
                }
                return {
                    ...prev,
                    results: newResults,
                    totalDocs: Math.max(0, totalDocs - 1),
                    deletedDocCount: deletedDocCount + 1
                };
            });
        } catch (error) {
            console.error('Error deleting blog:', error);
            toast.error(error.response?.data?.error || 'Failed to delete story. Please try again.');
            setIsDeleteDialogOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Toaster />
            <div className="flex gap-6 border-b border-border pb-6 mb-6 items-center p-3 rounded-2xl hover:bg-muted/40 transition-all duration-150">
                {banner && (
                    <img
                        src={banner}
                        alt={title}
                        className="hidden sm:block w-28 h-24 rounded-xl flex-none bg-muted object-cover shadow-sm"
                    />
                )}

                <div className="flex flex-col justify-between py-1 w-full">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="success" className="text-[10px] py-0 px-2">Published</Badge>
                            <span className="text-xs text-muted-foreground">{getDay(publishedAt)}</span>
                        </div>
                        <Link
                            to={`/blog/${blog_id}`}
                            className="text-base sm:text-lg font-bold font-inter text-foreground hover:text-purple duration-150 line-clamp-2"
                        >
                            {title}
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <Link to={`/editor/${blog_id}`}>
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                </Button>
                            </Link>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="gap-1.5 text-xs text-red hover:text-red hover:bg-red/10"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                            </Button>
                        </div>

                        <BlogStats stats={activity} />
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-full bg-red/10 text-red flex items-center justify-center mb-2 mx-auto sm:mx-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <DialogTitle>Delete this story permanently?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{title}"</span>? This action is irreversible and all comments and reads will be permanently purged.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export const MangeDraftBlogPost = ({ blog }) => {
    let { title, des, blog_id, index } = blog;
    index++;
    const { userAuth: { access_token } } = useContext(UserContext);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const { setStateFunc } = blog;

        try {
            await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-blog`, { blog_id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            setIsDeleteDialogOpen(false);
            setStateFunc((prev) => {
                if (!prev) return null;
                const { deletedDocCount = 0, totalDocs = 0, results = [] } = prev;
                const newResults = results.filter((item) => item.blog_id !== blog_id);
                if (!newResults.length && totalDocs - 1 > 0) {
                    return null;
                }
                return {
                    ...prev,
                    results: newResults,
                    totalDocs: Math.max(0, totalDocs - 1),
                    deletedDocCount: deletedDocCount + 1
                };
            });
        } catch (error) {
            console.error('Error deleting draft:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="flex gap-4 sm:gap-6 pb-6 border-b border-border mb-6 items-start p-3 rounded-2xl hover:bg-muted/40 transition-all duration-150">
                <span className="text-2xl sm:text-3xl font-black text-muted-foreground/40 font-mono w-8">
                    {index < 10 ? '0' + index : index}
                </span>

                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="warning" className="text-[10px] py-0 px-2">Draft</Badge>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold font-inter text-foreground mb-1.5">
                        {title}
                    </h2>

                    <p className="text-sm font-gelasio text-muted-foreground line-clamp-2 leading-relaxed">
                        {des && des.length ? des : "No description provided yet."}
                    </p>

                    <div className="flex items-center gap-2 mt-4">
                        <Link to={`/editor/${blog_id}`}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Continue Writing</span>
                            </Button>
                        </Link>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="gap-1.5 text-xs text-red hover:text-red hover:bg-red/10"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-full bg-red/10 text-red flex items-center justify-center mb-2 mx-auto sm:mx-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <DialogTitle>Discard this draft?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently discard the draft <span className="font-semibold text-foreground">"{title}"</span>? This cannot be recovered.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Keep Draft
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Discard'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};