'use client';

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { submitFeedback } from "@/app/actions/feedback";
import { useState } from "react";

export default function Footer() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (type: 'suggestion' | 'bug', e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const description = formData.get(type === 'suggestion' ? 'suggestion' : 'bugDescription') as string;
    const email = formData.get('email') as string;

    try {
      const result = await submitFeedback(type, description, email);
      if (result.success) {
        (document.getElementById(`${type}_modal`) as HTMLDialogElement)?.close();
        alert('Thank you for your feedback!');
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content">
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2 mb-2">
          <button 
            className="btn btn-sm btn-primary" 
            onClick={() => (document.getElementById('suggestion_modal') as HTMLDialogElement)?.showModal()}
          >
            💡 Suggest Feature
          </button>
          <button 
            className="btn btn-sm btn-error" 
            onClick={() => (document.getElementById('bug_modal') as HTMLDialogElement)?.showModal()}
          >
            🐛 Report Bug
          </button>
        </div>

        <dialog id="suggestion_modal" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Suggest a Feature</h3>
            <form onSubmit={(e) => handleSubmit('suggestion', e)} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Your Suggestion</span>
                </label>
                <textarea 
                  name="suggestion"
                  required
                  className="textarea textarea-bordered h-24" 
                  placeholder="Describe the feature you'd like to see..."
                ></textarea>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Your Email (optional)</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  className="input input-bordered" 
                  placeholder="email@example.com"
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => (document.getElementById('suggestion_modal') as HTMLDialogElement)?.close()}>Close</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <dialog id="bug_modal" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Report a Bug</h3>
            <form onSubmit={(e) => handleSubmit('bug', e)} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bug Description</span>
                </label>
                <textarea 
                  name="bugDescription"
                  required
                  className="textarea textarea-bordered h-24" 
                  placeholder="Please describe the bug and steps to reproduce it..."
                ></textarea>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Your Email (optional)</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  className="input input-bordered" 
                  placeholder="email@example.com"
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => (document.getElementById('bug_modal') as HTMLDialogElement)?.close()}>Close</button>
                <button type="submit" className="btn btn-error" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <p>Copyright © 2025 - All rights reserved by Veridian</p>
        <a 
          href="https://x.com/AlphaEdge17923" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-sm btn-ghost gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="fill-current">
            <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246z"/>
          </svg>
          Follow on X
        </a>
      </div>
    </footer>
  );
}
