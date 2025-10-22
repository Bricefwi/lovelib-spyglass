import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  cover_url: string;
  cover_credit: string;
  category: string;
  sources: any;
  published_at: string;
  author_name: string;
  author_role: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', slug)
        .not('published_at', 'is', null)
        .maybeSingle();

      if (error) {
        console.error('Error fetching post:', error);
        navigate('/blog');
      } else if (!data) {
        navigate('/blog');
      } else {
        setPost(data as BlogPost);
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-32">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-32 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au blog
        </Button>

        <article>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-8 text-muted-foreground text-sm">
            <span>
              {new Date(post.published_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            <span>•</span>
            <span>{post.author_name}</span>
            <span>•</span>
            <span>{post.author_role}</span>
          </div>

          {post.cover_url && (
            <div className="relative w-full h-96 mb-8 rounded-2xl overflow-hidden border border-border">
              <img
                src={post.cover_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              {post.cover_credit && (
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {post.cover_credit}
                </p>
              )}
            </div>
          )}

          <div className="prose prose-lg max-w-none mb-12">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-3xl font-bold mt-12 mb-6 text-foreground">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-2xl font-semibold mt-8 mb-4 text-foreground">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-foreground mb-4 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4 text-foreground">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-4 text-foreground">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="mb-2">{children}</li>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono border border-border">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 border border-border">
                    {children}
                  </pre>
                ),
              }}
            >
              {post.content_md}
            </ReactMarkdown>
          </div>

          {post.sources && post.sources.length > 0 && (
            <section className="border-t border-border pt-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Sources</h2>
              <ul className="space-y-2">
                {post.sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {source.label || source.url}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
