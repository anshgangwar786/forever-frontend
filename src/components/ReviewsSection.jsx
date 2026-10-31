'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useShopContext } from '../context/ShopContext';

// Helper Star Component supporting interactive hovering and display
export const StarRating = ({ rating = 0, size = 'sm', interactive = false, onRatingChange = null }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-7 h-7'
    };

    const effectiveRating = hoverRating || rating;

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= effectiveRating;
                const isHalf = !isFilled && star - 0.5 <= effectiveRating;

                return (
                    <button
                        type="button"
                        key={star}
                        disabled={!interactive}
                        onClick={() => interactive && onRatingChange && onRatingChange(star)}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        className={`${interactive ? 'cursor-pointer hover:scale-115 transition-transform' : 'cursor-default'} focus:outline-none`}
                        aria-label={`${star} star`}
                    >
                        <svg
                            className={`${sizeClasses[size] || sizeClasses.sm} transition-colors ${
                                isFilled
                                    ? 'text-amber-400 fill-amber-400'
                                    : isHalf
                                    ? 'text-amber-400 fill-amber-200'
                                    : 'text-gray-300 fill-gray-200'
                            }`}
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};

export default function ReviewsSection({ productId, productDescription, onRatingUpdate }) {
    const { backendUrl, token } = useShopContext();

    const [activeTab, setActiveTab] = useState('reviews');
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        breakdownPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [userReview, setUserReview] = useState(null);
    const [canReview, setCanReview] = useState(false);

    // Form state
    const [formRating, setFormRating] = useState(5);
    const [formTitle, setFormTitle] = useState('');
    const [formComment, setFormComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Fetch reviews & stats
    const fetchReviews = useCallback(async () => {
        if (!productId) return;
        try {
            setLoading(true);
            const response = await fetch(`${backendUrl}/api/v1/review/product/${productId}`);
            const res = await response.json();
            if (res?.success && res.data) {
                const data = res.data;
                setReviews(data.reviews || []);
                setStats(data.stats || {
                    totalReviews: 0,
                    averageRating: 0,
                    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                    breakdownPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
                });

                if (onRatingUpdate) {
                    onRatingUpdate(data.stats?.averageRating || 0, data.stats?.totalReviews || 0);
                }
            }
        } catch (err) {
            console.error("Failed to load reviews:", err);
        } finally {
            setLoading(false);
        }
    }, [productId, backendUrl, onRatingUpdate]);

    // Fetch logged in user's review and purchase eligibility
    const fetchUserReview = useCallback(async () => {
        if (!productId || !token) {
            setUserReview(null);
            setCanReview(false);
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/api/v1/review/my-review/${productId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    token,
                    Authorization: `Bearer ${token}`
                }
            });
            const res = await response.json();
            if (res?.success && res.data) {
                const data = res.data;
                const myRev = data.review !== undefined ? data.review : data;
                const isEligible = data.canReview !== undefined ? data.canReview : !!myRev;

                setUserReview(myRev);
                setCanReview(isEligible);

                if (myRev) {
                    setFormRating(myRev.rating || 5);
                    setFormTitle(myRev.title || '');
                    setFormComment(myRev.comment || '');
                } else {
                    setFormRating(5);
                    setFormTitle('');
                    setFormComment('');
                }
            } else {
                setUserReview(null);
                setCanReview(false);
                setFormRating(5);
                setFormTitle('');
                setFormComment('');
            }
        } catch (err) {
            console.error("Failed to fetch user review eligibility:", err);
            setCanReview(false);
        }
    }, [productId, backendUrl, token]);

    useEffect(() => {
        fetchReviews();
        fetchUserReview();
    }, [fetchReviews, fetchUserReview]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error("Please login to submit a review");
            return;
        }

        if (!formComment.trim() || formComment.trim().length < 3) {
            toast.error("Please enter a review of at least 3 characters");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                productId,
                rating: formRating,
                title: formTitle.trim(),
                comment: formComment.trim()
            };

            const response = await fetch(`${backendUrl}/api/v1/review/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token,
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const res = await response.json();

            if (response.ok && res?.success) {
                toast.success(
                    isEditing
                        ? "Review updated! It is pending approval by the admin or seller."
                        : "Thank you! Your review has been submitted and is pending approval by the admin or seller."
                );
                setIsEditing(false);
                await fetchReviews();
                await fetchUserReview();
            } else {
                toast.error(res?.message || "Failed to submit review");
            }
        } catch (err) {
            toast.error(err.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            setDeletingId(reviewId);
            const response = await fetch(`${backendUrl}/api/v1/review/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token,
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reviewId })
            });

            const res = await response.json();

            if (response.ok && res?.success) {
                toast.success("Review deleted successfully");
                setUserReview(null);
                setIsEditing(false);
                setFormRating(5);
                setFormTitle('');
                setFormComment('');
                await fetchReviews();
                await fetchUserReview();
            } else {
                toast.error(res?.message || "Failed to delete review");
            }
        } catch (err) {
            toast.error(err.message || "Failed to delete review");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div id="reviews-section" className="mt-20">
            {/* Tab Navigation */}
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('description')}
                    className={`px-6 py-3 text-sm font-medium transition cursor-pointer ${
                        activeTab === 'description'
                            ? 'border-b-2 border-black font-semibold text-black bg-gray-50'
                            : 'text-gray-500 hover:text-black'
                    }`}
                >
                    Description
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'reviews'
                            ? 'border-b-2 border-black font-semibold text-black bg-gray-50'
                            : 'text-gray-500 hover:text-black'
                    }`}
                >
                    <span>Customer Reviews</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                        {stats.totalReviews}
                    </span>
                </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'description' ? (
                <div className="border border-t-0 p-6 sm:p-8 text-sm text-gray-600 leading-relaxed flex flex-col gap-4">
                    <p>{productDescription || "No detailed description provided."}</p>
                    <p>
                        An e-commerce website is an online platform that facilitates the
                        buying and selling of products or services over the internet. It
                        serves as a virtual marketplace where businesses and individuals can
                        showcase their products, interact with customers, and conduct
                        transactions without the need for a physical presence.
                    </p>
                    <p>
                        Each product page features high-resolution photography, selectable size
                        options, real customer ratings, and seamless integration with the cart
                        and checkout pipeline.
                    </p>
                </div>
            ) : (
                <div className="border border-t-0 p-6 sm:p-8 bg-white">
                    {/* Header Summary & Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b">
                        {/* Overall Score */}
                        <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl text-center border border-gray-100">
                            <span className="text-5xl font-bold text-gray-900 tracking-tight">
                                {stats.averageRating.toFixed(1)}
                            </span>
                            <div className="mt-2">
                                <StarRating rating={stats.averageRating} size="md" />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                                Based on {stats.totalReviews} verified {stats.totalReviews === 1 ? 'review' : 'reviews'}
                            </p>
                        </div>

                        {/* Star Distribution Progress Bars */}
                        <div className="md:col-span-8 flex flex-col justify-center gap-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = stats.breakdown[star] || 0;
                                const pct = stats.breakdownPercentages[star] || 0;
                                return (
                                    <div key={star} className="flex items-center gap-3 text-xs">
                                        <span className="w-12 font-medium text-gray-600 flex items-center gap-1">
                                            {star} <svg className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </span>
                                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="w-16 text-right text-gray-400 font-medium">
                                            {count} ({pct}%)
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Write / Edit Review Section */}
                    <div className="py-8 border-b">
                        {!token ? (
                            <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center flex flex-col items-center gap-3">
                                <p className="text-sm text-gray-600 font-medium">
                                    Have you purchased this product? Sign in to write a verified review.
                                </p>
                                <p className="text-xs text-gray-400">
                                    Only customers who have ordered this item can leave a review.
                                </p>
                                <Link
                                    href="/login"
                                    className="px-6 py-2.5 bg-black text-white text-xs font-medium tracking-wide rounded-md hover:bg-gray-800 transition"
                                >
                                    SIGN IN TO WRITE A REVIEW
                                </Link>
                            </div>
                        ) : userReview && !isEditing ? (
                            <div className={`p-6 rounded-xl border ${
                                userReview.status === 'rejected'
                                    ? 'bg-red-50/50 border-red-200'
                                    : userReview.status === 'approved' || userReview.isApproved
                                    ? 'bg-emerald-50/40 border-emerald-200'
                                    : 'bg-amber-50/50 border-amber-200'
                            }`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-800 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                                            Your Review
                                        </span>
                                        <StarRating rating={userReview.rating} size="sm" />
                                        <span className="text-xs text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                            ✓ Verified Buyer
                                        </span>
                                        {userReview.status === 'rejected' ? (
                                            <span className="text-xs font-semibold text-red-700 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                ✕ Not Approved
                                            </span>
                                        ) : userReview.status === 'approved' || userReview.isApproved ? (
                                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                ✓ Published Live
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                ⏳ Pending Admin / Seller Approval
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-xs font-medium text-gray-700 hover:text-black underline cursor-pointer"
                                        >
                                            Edit Review
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={() => handleDeleteReview(userReview._id)}
                                            disabled={deletingId === userReview._id}
                                            className="text-xs font-medium text-red-600 hover:text-red-700 underline cursor-pointer"
                                        >
                                            {deletingId === userReview._id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>

                                {userReview.status !== 'approved' && !userReview.isApproved && (
                                    <div className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
                                        userReview.status === 'rejected'
                                            ? 'bg-red-100/70 text-red-800 border border-red-200'
                                            : 'bg-amber-100/80 text-amber-900 border border-amber-200'
                                    }`}>
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                            {userReview.status === 'rejected'
                                                ? `This review was not approved by store moderation.${userReview.rejectionReason ? ` Reason: ${userReview.rejectionReason}` : ''}`
                                                : "Your review is currently awaiting approval from the store admin or seller before it is made publicly visible."}
                                        </span>
                                    </div>
                                )}

                                {userReview.title && (
                                    <h4 className="font-semibold text-gray-900 mt-3 text-sm">{userReview.title}</h4>
                                )}
                                <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-line">{userReview.comment}</p>
                                <p className="text-xs text-gray-400 mt-3">
                                    Posted on {new Date(userReview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        ) : !canReview && !isEditing ? (
                            <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center flex flex-col items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h4 className="text-sm font-semibold text-gray-900">Verified Buyers Only</h4>
                                <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                                    Reviews are reserved for customers who have placed an order for this item. Once you order this product, you'll be able to leave your review here!
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {isEditing ? "Edit Your Review" : "Write a Customer Review"}
                                        </h3>
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Verified Purchase: You have ordered this item</span>
                                        </div>
                                    </div>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
                                        >
                                            Cancel Editing
                                        </button>
                                    )}
                                </div>

                                {/* Star Picker */}
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Overall Rating <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <StarRating
                                            rating={formRating}
                                            size="lg"
                                            interactive={true}
                                            onRatingChange={setFormRating}
                                        />
                                        <span className="text-xs font-semibold text-gray-700">
                                            {formRating === 5 && "5 - Excellent"}
                                            {formRating === 4 && "4 - Good"}
                                            {formRating === 3 && "3 - Average"}
                                            {formRating === 2 && "2 - Poor"}
                                            {formRating === 1 && "1 - Terrible"}
                                        </span>
                                    </div>
                                </div>

                                {/* Title (Optional) */}
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Headline / Title <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        placeholder="e.g. Perfect fit and soft fabric!"
                                        maxLength={100}
                                        className="w-full text-sm px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                                    />
                                </div>

                                {/* Comment (Required) */}
                                <div className="mb-5">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Your Review <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formComment}
                                        onChange={(e) => setFormComment(e.target.value)}
                                        placeholder="What did you like or dislike about this product? How is the sizing and comfort?"
                                        rows={4}
                                        required
                                        minLength={3}
                                        maxLength={1500}
                                        className="w-full text-sm px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black resize-y"
                                    />
                                    <span className="text-[11px] text-gray-400">Minimum 3 characters</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-black text-white text-xs font-medium tracking-wide rounded-lg hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {submitting ? "SUBMITTING..." : (isEditing || userReview ? "UPDATE REVIEW" : "SUBMIT REVIEW")}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition cursor-pointer"
                                        >
                                            CANCEL
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>

                    {/* All Reviews Feed */}
                    <div className="pt-8">
                        <h3 className="text-base font-semibold text-gray-900 mb-6 flex items-center justify-between">
                            <span>Customer Reviews ({reviews.length})</span>
                        </h3>

                        {loading ? (
                            <div className="py-12 text-center text-sm text-gray-400">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-sm font-medium text-gray-600">No customer reviews yet</p>
                                <p className="text-xs text-gray-400 mt-1">Be the first to leave a review for this item!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-gray-100">
                                {reviews.map((rev) => {
                                    const isAuthor = userReview && userReview._id === rev._id;
                                    const initials = (rev.userName || 'Customer')
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2);

                                    return (
                                        <div key={rev._id} className="py-6 first:pt-0 last:pb-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold tracking-wider">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {rev.userName}
                                                            </span>
                                                            {rev.verifiedPurchase && (
                                                                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                                                    ✓ Verified Buyer
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(rev.createdAt).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Delete button if owner */}
                                                {isAuthor && (
                                                    <button
                                                        onClick={() => handleDeleteReview(rev._id)}
                                                        disabled={deletingId === rev._id}
                                                        className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                                                        title="Delete your review"
                                                    >
                                                        {deletingId === rev._id ? "Deleting..." : "Delete"}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mt-3">
                                                <StarRating rating={rev.rating} size="xs" />
                                            </div>

                                            {rev.title && (
                                                <h4 className="font-semibold text-gray-900 mt-2 text-sm">{rev.title}</h4>
                                            )}

                                            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-line">
                                                {rev.comment}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
