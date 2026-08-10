/* =========================================================
   MONEYWISE
   Main JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       VARIABLES
    ===================================================== */

    const articlesGrid =
        document.querySelector("#articlesGrid");

    const searchInput =
        document.querySelector("#searchInput");

    const categoryButtons =
        document.querySelectorAll(".filter-btn");

    let articles = [];

    let currentCategory = "ทั้งหมด";

    let currentSearch = "";


    /* =====================================================
       INITIALIZE SETTINGS
    ===================================================== */

    function initializeSettings() {

        if (typeof SETTINGS === "undefined") {

            console.warn(
                "MoneyWise: SETTINGS ไม่พบ"
            );

            return;

        }


        /* Discord */

        const discordButtons =
            document.querySelectorAll(
                "[data-discord]"
            );


        discordButtons.forEach(button => {

            button.href =
                SETTINGS.discordLink;

            button.target =
                "_blank";

            button.rel =
                "noopener noreferrer";

        });


        /* Website Name */

        const websiteNames =
            document.querySelectorAll(
                "[data-website-name]"
            );


        websiteNames.forEach(element => {

            element.textContent =
                SETTINGS.website.name;

        });


        /* Advertisement */

        setupAdvertisements();

    }


    /* =====================================================
       LOAD ARTICLES
    ===================================================== */

    async function loadArticles() {

        try {

            const response =
                await fetch(
                    "data/articles.json"
                );


            if (!response.ok) {

                throw new Error(
                    "ไม่สามารถโหลด articles.json ได้"
                );

            }


            articles =
                await response.json();


            renderArticles(
                articles
            );


        } catch (error) {

            console.error(
                "MoneyWise Articles Error:",
                error
            );


            showError();

        }

    }


    /* =====================================================
       RENDER ARTICLES
    ===================================================== */

    function renderArticles(list) {

        if (!articlesGrid) {

            return;

        }


        if (!list.length) {

            articlesGrid.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        🔎
                    </div>

                    <h3>
                        ไม่พบบทความ
                    </h3>

                    <p>
                        ลองค้นหาด้วยคำอื่น
                    </p>

                </div>

            `;

            return;

        }


        articlesGrid.innerHTML =
            list
                .map(
                    (article, index) =>
                        createArticleCard(
                            article,
                            index
                        )
                )
                .join("");


        initializeRevealAnimation();

        initializeArticleLinks();

    }


    /* =====================================================
       CREATE ARTICLE CARD
    ===================================================== */

    function createArticleCard(
        article,
        index
    ) {

        const icon =
            getArticleIcon(
                article.icon
            );


        return `

            <article
                class="article-card reveal"
                data-index="${index}"
                data-article-id="${escapeAttribute(article.id)}"
                role="link"
                tabindex="0"
            >

                <div class="article-card-image">

                    <div class="article-card-icon">

                        ${icon}

                    </div>

                </div>


                <div class="article-card-content">

                    <div class="article-card-category">

                        ${escapeHTML(
                            article.category
                        )}

                    </div>


                    <h3>

                        ${escapeHTML(
                            article.title
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            article.description
                        )}

                    </p>


                    <div class="article-card-footer">

                        <span>

                            ${escapeHTML(
                                article.readTime
                            )}

                        </span>


                        <span class="article-read">

                            อ่านบทความ

                            <span>
                                →
                            </span>

                        </span>

                    </div>

                </div>

            </article>

        `;

    }


    /* =====================================================
       ARTICLE ICON
    ===================================================== */

    function getArticleIcon(icon) {

        const icons = {

            "wallet": "◈",

            "piggy-bank": "🐷",

            "credit-card": "▣",

            "receipt": "▤",

            "trending-up": "↗",

            "brain": "◉",

            "briefcase": "▰",

            "calculator": "＋",

            "shield-check": "✓",

            "target": "◎"

        };


        return icons[icon] || "฿";

    }


    /* =====================================================
       ARTICLE LINKS
    ===================================================== */

    function initializeArticleLinks() {

        const cards =
            document.querySelectorAll(
                ".article-card"
            );


        cards.forEach(card => {

            const articleId =
                card.dataset.articleId;


            if (!articleId) {

                return;

            }


            /* CLICK */

            card.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `article.html?id=${encodeURIComponent(articleId)}`;

                }
            );


            /* KEYBOARD */

            card.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();


                        window.location.href =
                            `article.html?id=${encodeURIComponent(articleId)}`;

                    }

                }
            );

        });

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            event => {

                currentSearch =
                    event.target.value
                        .trim()
                        .toLowerCase();


                filterArticles();

            }
        );

    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentCategory =
                    button.dataset.category ||
                    button.textContent.trim();


                filterArticles();

            }
        );

    });


    /* =====================================================
       FILTER ARTICLES
    ===================================================== */

    function filterArticles() {

        let filtered =
            [...articles];


        /* CATEGORY */

        if (
            currentCategory &&
            currentCategory !== "ทั้งหมด"
        ) {

            filtered =
                filtered.filter(
                    article =>
                        article.category ===
                        currentCategory
                );

        }


        /* SEARCH */

        if (currentSearch) {

            filtered =
                filtered.filter(
                    article => {

                        const searchableText = [

                            article.title,

                            article.description,

                            article.category

                        ]
                            .join(" ")
                            .toLowerCase();


                        return searchableText
                            .includes(
                                currentSearch
                            );

                    }
                );

        }


        renderArticles(
            filtered
        );

    }


    /* =====================================================
       ADVERTISEMENT
    ===================================================== */

    function setupAdvertisements() {

        if (
            typeof SETTINGS === "undefined" ||
            !SETTINGS.ads
        ) {

            return;

        }


        const adElements =
            document.querySelectorAll(
                "[data-ad]"
            );


        adElements.forEach(
            element => {

                const type =
                    element.dataset.ad;


                const ad =
                    SETTINGS.ads[type];


                if (!ad) {

                    element.style.display =
                        "none";

                    return;

                }


                if (!ad.enabled) {

                    element.style.display =
                        "none";

                    return;

                }


                const link =
                    element.querySelector(
                        "[data-ad-link]"
                    );


                const image =
                    element.querySelector(
                        "[data-ad-image]"
                    );


                const text =
                    element.querySelector(
                        "[data-ad-text]"
                    );


                if (ad.image && image) {

                    image.src =
                        ad.image;

                    image.style.display =
                        "block";

                }


                if (ad.link && link) {

                    link.href =
                        ad.link;

                    link.target =
                        "_blank";

                    link.rel =
                        "noopener noreferrer";

                }


                if (text) {

                    text.textContent =
                        ad.title ||
                        "พื้นที่โฆษณา";

                }

            }
        );

    }


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    function initializeRevealAnimation() {

        const revealElements =
            document.querySelectorAll(
                ".reveal"
            );


        if (!revealElements.length) {

            return;

        }


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "show"
                                );


                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {

                    threshold:
                        0.12,

                    rootMargin:
                        "0px 0px -40px 0px"

                }
            );


        revealElements.forEach(
            element => {

                observer.observe(
                    element
                );

            }
        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showError() {

        if (!articlesGrid) {

            return;

        }


        articlesGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <h3>
                    ไม่สามารถโหลดบทความได้
                </h3>

                <p>
                    กรุณาตรวจสอบไฟล์
                    data/articles.json
                </p>

            </div>

        `;

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       ESCAPE ATTRIBUTE
    ===================================================== */

    function escapeAttribute(value) {

        return escapeHTML(
            value || ""
        );

    }


    /* =====================================================
       START
    ===================================================== */

    initializeSettings();

    loadArticles();

});
