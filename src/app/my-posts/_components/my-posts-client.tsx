'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Calendar, Sparkles, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Post {
  id: string;
  foodName: string;
  freshness: string;
  expirationDate: string;
  imageUri: string;
}

export function MyPostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem('leftoverPosts') || '[]');
    setPosts(storedPosts.reverse()); // Show newest first
  }, []);

  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts.filter((post) => post.id !== postId);
    setPosts(updatedPosts);
    
    const storedPosts = JSON.parse(localStorage.getItem('leftoverPosts') || '[]');
    const newStoredPosts = storedPosts.filter((post: Post) => post.id !== postId);
    localStorage.setItem('leftoverPosts', JSON.stringify(newStoredPosts));
    localStorage.setItem('platesSavedCount', newStoredPosts.length.toString());
    window.dispatchEvent(new Event('storageUpdate'));

    toast({ title: 'Post Deleted', description: 'Your leftover post has been removed.' });
  };
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Posts Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You haven't posted any leftovers. Go ahead and share some!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="flex flex-row items-start gap-4">
            <Image
              src={post.imageUri}
              alt={post.foodName}
              width={80}
              height={80}
              className="rounded-lg object-cover"
              data-ai-hint="food meal"
            />
            <div className="flex-grow">
              <CardTitle>{post.foodName}</CardTitle>
              <CardDescription className="flex flex-col gap-1 mt-2">
                 <span className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4" /> Freshness: {post.freshness}</span>
                 <span className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4" /> Expires: {new Date(post.expirationDate).toLocaleDateString()}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your leftover post.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
