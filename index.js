document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav ul");

  menuToggle.addEventListener("click", function () {
    nav.classList.toggle("active");
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        nav.classList.remove("active");

        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: "smooth",
        });
      }
    });
  });

  // Ratings management
  let ratings = JSON.parse(localStorage.getItem("serviceRatings")) || [];

  // Update year in footer
  document.getElementById("year").textContent = new Date().getFullYear();

  // Star rating system
  const allStars = document.querySelectorAll(".stars i");
  allStars.forEach((star) => {
    star.addEventListener("click", function () {
      const rating = parseInt(this.getAttribute("data-rating"));
      const category = this.parentElement.getAttribute("data-category");

      // Remove active class from all stars in this category
      const categoryStars = this.parentElement.querySelectorAll("i");
      categoryStars.forEach((s, index) => {
        if (index < rating) {
          s.classList.add("active");
          s.classList.remove("far");
          s.classList.add("fas");
        } else {
          s.classList.remove("active");
          s.classList.remove("fas");
          s.classList.add("far");
        }
      });

      // Store rating temporarily
      this.parentElement.setAttribute("data-current-rating", rating);
    });
  });

  // Submit rating
  const ratingForm = document.getElementById("rating-form");
  ratingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Collect rating data
    const name = document.getElementById("customer-name").value || "Anonymous";
    const feedback = document.getElementById("customer-feedback").value;
    const recommend =
      document.querySelector('input[name="recommend"]:checked').value === "yes";

    // Collect star ratings
    const qualityRating = parseInt(
      document
        .querySelector('.stars[data-category="quality"]')
        .getAttribute("data-current-rating") || 0
    );
    const responseRating = parseInt(
      document
        .querySelector('.stars[data-category="response"]')
        .getAttribute("data-current-rating") || 0
    );
    const complaintsRating = parseInt(
      document
        .querySelector('.stars[data-category="complaints"]')
        .getAttribute("data-current-rating") || 0
    );

    if (qualityRating === 0 || responseRating === 0 || complaintsRating === 0) {
      alert("Please rate all categories before submitting");
      return;
    }

    // Calculate average
    const averageRating = (
      (qualityRating + responseRating + complaintsRating) /
      3
    ).toFixed(1);

    // Create rating object
    const newRating = {
      id: Date.now(),
      name: name,
      date: new Date().toLocaleDateString("en-US"),
      quality: qualityRating,
      response: responseRating,
      complaints: complaintsRating,
      average: parseFloat(averageRating),
      feedback: feedback,
      recommend: recommend,
    };

    // Add rating to the list
    ratings.unshift(newRating);
    localStorage.setItem("serviceRatings", JSON.stringify(ratings));

    // Update display
    updateReviewsDisplay();

    // Reset form
    ratingForm.reset();
    allStars.forEach((star) => {
      star.classList.remove("active", "fas");
      star.classList.add("far");
    });

    alert(
      "Thank you for your rating! Your feedback has been submitted successfully."
    );
  });

  // Display reviews
  function updateReviewsDisplay() {
    const reviewsContainer = document.getElementById("reviews-container");
    const overallScore = document.getElementById("overall-score");
    const totalRatings = document.getElementById("total-ratings");
    const starsDisplay = document.querySelector(".stars-display");

    if (ratings.length === 0) {
      reviewsContainer.innerHTML =
        '<p class="no-reviews">No reviews yet. Be the first to rate!</p>';
      overallScore.textContent = "0.0";
      totalRatings.textContent = "0";
      starsDisplay.innerHTML = '<i class="far fa-star"></i>'.repeat(5);
      return;
    }

    // Calculate overall average
    const totalAverage =
      ratings.reduce((sum, rating) => sum + rating.average, 0) / ratings.length;
    overallScore.textContent = totalAverage.toFixed(1);
    totalRatings.textContent = ratings.length;

    // Update overall stars
    const fullStars = Math.floor(totalAverage);
    const hasHalfStar = totalAverage % 1 >= 0.5;

    starsDisplay.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("i");
      if (i <= fullStars) {
        star.className = "fas fa-star";
      } else if (i === fullStars + 1 && hasHalfStar) {
        star.className = "fas fa-star-half-alt";
      } else {
        star.className = "far fa-star";
      }
      starsDisplay.appendChild(star);
    }

    // Display individual reviews
    reviewsContainer.innerHTML = "";
    ratings.slice(0, 6).forEach((rating) => {
      const reviewCard = document.createElement("div");
      reviewCard.className = "review-card";

      reviewCard.innerHTML = `
                <div class="review-header">
                    <span class="reviewer-name">${rating.name}</span>
                    <span class="review-date">${rating.date}</span>
                </div>
                <div class="review-stars">
                    ${'<i class="fas fa-star"></i>'.repeat(
                      Math.floor(rating.average)
                    )}
                    ${
                      rating.average % 1 >= 0.5
                        ? '<i class="fas fa-star-half-alt"></i>'
                        : ""
                    }
                    ${'<i class="far fa-star"></i>'.repeat(
                      5 - Math.ceil(rating.average)
                    )}
                    <span> (${rating.average.toFixed(1)})</span>
                </div>
                ${
                  rating.feedback
                    ? `<div class="review-comment">${rating.feedback}</div>`
                    : ""
                }
                <div class="review-recommend">
                    ${
                      rating.recommend
                        ? '<i class="fas fa-thumbs-up"></i> Recommends this service'
                        : '<i class="fas fa-thumbs-down"></i> Does not recommend this service'
                    }
                </div>
            `;

      reviewsContainer.appendChild(reviewCard);
    });
  }

  // Initial setup
  updateReviewsDisplay();
});
