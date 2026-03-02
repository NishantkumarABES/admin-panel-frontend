import { BookOpen, FileText, Video, Briefcase, ArrowRight, Library } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getArticlesAnalytics } from "../../../services/article.service";
import { getBooksAnalytics } from "../../../services/book.service";
import { getVideoAnalytics } from "../../../services/video.service";
import { getJobsAnalytics } from "../../../services/job.service";
import type { ArticleAnalytics } from "../../my-reposit/articles/articles.types";
import type { BookAnalytics } from "../../my-reposit/books/books.types";
import type { VideoAnalytics } from "../../my-reposit/videos/videos.types";
import type { JobAnalytics } from "../../my-reposit/jobs/jobs.types";

interface RepositItem {
    label: string;
    total: number;
    published: number;
    inReview: number;
    icon: React.ReactNode;
    color: string;
    bg: string;
    path: string;
}

export default function DashboardRepositOverview() {
    const [loading, setLoading] = useState(true);
    const [articles, setArticles] = useState<ArticleAnalytics | null>(null);
    const [books, setBooks] = useState<BookAnalytics | null>(null);
    const [videos, setVideos] = useState<VideoAnalytics | null>(null);
    const [jobs, setJobs] = useState<JobAnalytics | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [a, b, v, j] = await Promise.all([
                    getArticlesAnalytics(),
                    getBooksAnalytics(),
                    getVideoAnalytics(),
                    getJobsAnalytics(),
                ]);
                setArticles(a);
                setBooks(b);
                setVideos(v);
                setJobs(j);
            } catch (err) {
                console.error("Error fetching reposit analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        const timer = setTimeout(() => fetchAll(), 300);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="clay-card">
                <div className="flex items-center gap-2" style={{ marginBottom: "16px" }}>
                    <Library className="w-5 h-5" style={{ color: "#a285ff" }} />
                    <h2 className="text-base font-semibold text-gray-900">My Reposit</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="clay-inset" style={{ padding: "16px" }}>
                            <div className="clay-skeleton" style={{ height: "32px", width: "32px", borderRadius: "8px", marginBottom: "12px" }} />
                            <div className="clay-skeleton" style={{ height: "20px", width: "50%", marginBottom: "6px" }} />
                            <div className="clay-skeleton" style={{ height: "12px", width: "70%" }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const items: RepositItem[] = [
        {
            label: "Articles",
            total: articles?.total_articles ?? 0,
            published: articles?.published_articles ?? 0,
            inReview: articles?.in_review_articles ?? 0,
            icon: <FileText className="w-4.5 h-4.5" />,
            color: "#6b96ff",
            bg: "rgba(107, 150, 255, 0.08)",
            path: "/my-reposit/articles",
        },
        {
            label: "Books",
            total: books?.total_books ?? 0,
            published: books?.approved_books ?? 0,
            inReview: books?.in_review_books ?? 0,
            icon: <BookOpen className="w-4.5 h-4.5" />,
            color: "#4fcfa5",
            bg: "rgba(79, 207, 165, 0.08)",
            path: "/my-reposit/books",
        },
        {
            label: "Videos",
            total: videos?.total_videos ?? 0,
            published: videos?.published_videos ?? 0,
            inReview: videos?.in_review_videos ?? 0,
            icon: <Video className="w-4.5 h-4.5" />,
            color: "#ff9f47",
            bg: "rgba(255, 159, 71, 0.08)",
            path: "/my-reposit/videos",
        },
        {
            label: "Jobs",
            total: jobs?.total_jobs ?? 0,
            published: jobs?.published_jobs ?? 0,
            inReview: jobs?.in_review_jobs ?? 0,
            icon: <Briefcase className="w-4.5 h-4.5" />,
            color: "#a285ff",
            bg: "rgba(162, 133, 255, 0.08)",
            path: "/my-reposit/jobs",
        },
    ];



    return (
        <div className="clay-card">
            <div className="flex items-center gap-2" style={{ marginBottom: "16px" }}>
                <Library className="w-5 h-5" style={{ color: "#a285ff" }} />
                <h2 className="text-base font-semibold text-gray-900">My Reposit</h2>
                <span
                    className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                    style={{
                        background: "rgba(107, 213, 177, 0.15)",
                        color: "#3dba8e",
                    }}
                >
                    Doctor Content
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {items.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="group relative flex flex-col"
                        style={{
                            padding: "16px",
                            textDecoration: "none",
                            transition: "all 0.25s ease",
                            borderRadius: "14px",
                            background: `linear-gradient(135deg, ${item.color}08, ${item.color}14)`,
                            boxShadow: `inset 0 0 0 1px ${item.color}18, 2px 2px 8px rgba(0, 0, 0, 0.04)`,
                            borderLeft: `3px solid ${item.color}`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-3px)";
                            e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${item.color}25, 4px 4px 12px rgba(0, 0, 0, 0.06), 0 0 16px ${item.bg}`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${item.color}18, 2px 2px 8px rgba(0, 0, 0, 0.04)`;
                        }}
                    >
                        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                            <div
                                className="flex items-center justify-center"
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "10px",
                                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}35)`,
                                    color: item.color,
                                }}
                            >
                                {item.icon}
                            </div>
                            <ArrowRight
                                className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: item.color }}
                            />
                        </div>
                        <div className="text-xl font-bold text-gray-900" style={{ letterSpacing: "-0.02em", marginBottom: "1px" }}>
                            {item.total}
                        </div>
                        <div className="text-xs font-semibold" style={{ color: item.color, marginBottom: "8px" }}>
                            {item.label}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "#4fcfa5" }}>
                                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4fcfa5", display: "inline-block" }} />
                                {item.published} published
                            </span>
                            {item.inReview > 0 && (
                                <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "#ffc554" }}>
                                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ffc554", display: "inline-block" }} />
                                    {item.inReview} review
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
