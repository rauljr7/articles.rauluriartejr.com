;(function (window, document, undefined) {
    "use strict";
    const page_init = () => {
        let is_machine_dark = localStorage.getItem('ruj_is_dark_mode') !== null ? localStorage.getItem('ruj_is_dark_mode') : window.matchMedia('(prefers-color-scheme: dark)').matches;
        let body_element = document.getElementById("body");
        let authors_array = [
        {"id": "0e96f8d2-00f9-4d80-8046-f2a821f99fe4", "name": "Raúl Uriarte, Jr."}
        ];
        let get_sanitized_article_data_raw = (articles_data_raw) => {
            let sanitized_article_data_array = new Array();
            let data_array = articles_data_raw.data;
            data_array.forEach((current_article_object) => {
                let header_urls = current_article_object?.header_urls; // unused for now
                let article_author_id = current_article_object.user_created;
                let article_author = article_author_id === authors_array.filter((author_object => author_object.id === article_author_id))[0]?.id ? authors_array.filter((author_object => author_object.id === article_author_id))[0]?.name : article_author_id;
                let article_date = new Date(current_article_object.date_created);
                let article_date_string = "";
                if (get_current_locale() === "en-US") {
                    article_date_string = article_date.toLocaleString(get_current_locale(), { month: 'long' }) + " " + article_date.getDate() + ", " + article_date.getFullYear();
                } else
                if (get_current_locale() === "es-ES") {
                    article_date_string = article_date.getDate() + " de " + article_date.toLocaleString(get_current_locale(), { month: 'long' }) + " del " + article_date.getFullYear();
                }

                let sanitized_article_object = {
                    "author": article_author,
                    "locales": {},
                    "date": article_date_string
                };
                current_article_object.translations.forEach((article_object) => {
                    let article_locale = article_object.languages_id;
                    let new_article_object = {};
                    new_article_object[article_locale] = {
                        "title": article_object.title,
                        "slug": article_object.slug,
                        "tags": article_object.tags,
                        "content": article_object.content
                    };
                    Object.assign(sanitized_article_object.locales, new_article_object);
                });
                sanitized_article_data_array.push(sanitized_article_object);
            });
            return sanitized_article_data_array;
        };
        let
            get_article_data = () => {
                let article_data_json;
                if (window?.rauluriartejr?.article_data_json) {
                    article_data_json = window.rauluriartejr.article_data_json;
                } else {
                    let articles_data_raw = {};
                    article_data_json = get_sanitized_article_data_raw(articles_data_raw);
                    window.rauluriartejr = {};
                    window["rauluriartejr"]["article_data_json"] = article_data_json;
                }
                return article_data_json;
            },
            handle_click = (event) => {
                if (event.target.id === "dark-mode-toggle") {
                    is_machine_dark = !is_machine_dark;
                    localStorage.setItem("ruj_is_dark_mode", is_machine_dark);
                    trigger_mode();
                }
            },
            handle_submit = (event) => {
            event.preventDefault();
            },
            get_hash_vanity = () => {
                return "#/";
            },
            get_current_url = () => {
                let current_url = new URL(window.location.href);
                return current_url;
            },
            get_current_locale = () => {
                let current_locale = "en-US";
                if (window.location.href.includes("articles")) {
                    current_locale = "en-US";
                } else
                if (window.location.href.includes("articulos")) {
                    current_locale = "es-ES";
                }
                return current_locale;
            },
            parse_lang = () => {
                parse_flag();
                if (get_current_locale() === "en-US") {
                    document.querySelector("html").setAttribute("lang", "en");
                } else
                if (get_current_locale() === "es-ES") {
                    document.querySelector("html").setAttribute("lang", "es");
                }
            },
            load_and_empty_body = () => {
                if (get_current_locale() === "en-US") {
                    document.title = "Loading...";
                } else
                if (get_current_locale() === "es-ES") {
                    document.title = "Cargando...";
                }
                body_element.innerHTML = "";
            };
            function title_content_template_to_dom() {
                return new Promise((resolve, reject) => {
                    load_and_empty_body();
                    let body_html_template = '<div class="row"><h3 class="col ms-fullwidth ms-text-center" id="title"></h3></div><div class="row"><div id="content"></div></div>';
                    body_element.innerHTML = body_html_template;
                    if (body_element) {
                        resolve("Home Page Template Rendered");
                    } else {
                        reject("Home Page Template Render Error");
                    }
                })
            };
            let handle_load_home_page = () => {
                title_content_template_to_dom().then(() => {
                    let title = document.getElementById("title");
                    let content = document.getElementById("content");
                    content.innerHTML = '<table class="ms-table"><tbody id="articles_tbody"></tbody></table>';
                    if (get_current_locale() === "en-US") {
                        document.title = title.innerHTML = "Articles";
                    } else
                    if (get_current_locale() === "es-ES") {
                        document.title = title.innerHTML = "Artículos";
                    }
                    let articles_tbody = document.getElementById("articles_tbody");
                    articles_tbody.innerHTML = "";
                    let articles_tbody_content = "";
                    let article_data = get_article_data();
                    article_data.forEach((article_object) => {
                        let article_date = article_object.date;
                        let article_title = article_object.locales[get_current_locale()].title;
                        articles_tbody_content += "<tr><td><a href='" + get_hash_vanity() + article_object.locales[get_current_locale()].slug + "'>" + article_title + "</a></td><td>" + article_date + "</td></tr>";
                    });
                    articles_tbody.innerHTML = articles_tbody_content;
                });
            };
            let get_current_tag_from_url = () => {
                return get_current_url().hash.substring(get_hash_vanity().length).substring(5);
            },
            find_tag = (article_object) => {
                let article = article_object.locales[get_current_locale()].tags.filter((tag) => {
                    return tag === get_current_tag_from_url();
                });
                return article.length > 0;
            };
            let handle_tags_page = () => {
                title_content_template_to_dom().then(() => {
                    let title = document.getElementById("title");
                    let content = document.getElementById("content");
                    content.innerHTML = '<table class="ms-table"><tbody id="articles_tbody"></tbody></table>';
                    document.title = "#" + get_current_tag_from_url() + " tags";
                    title.innerHTML = "#" + get_current_tag_from_url();
                    let articles_tbody = document.getElementById("articles_tbody");
                    articles_tbody.innerHTML = "";
                    let articles_tbody_content = "";
                    let article_data = get_article_data();
                    let article_data_tags_array = article_data.filter(find_tag);
                    article_data_tags_array.forEach((article_object) => {
                        let article_date = article_object.date;
                        let article_title = article_object.locales[get_current_locale()].title;
                        articles_tbody_content += "<tr><td><a href='" + get_hash_vanity() + article_object.locales[get_current_locale()].slug + "'>" + article_title + "</a></td><td>" + article_date + "</td></tr>";
                    });
                    articles_tbody.innerHTML = articles_tbody_content;
                });
            };
            let find_slug = (article_object) => {
                let cleaned_hash = get_current_url().hash.substring(get_hash_vanity().length);
                return article_object.locales[get_current_locale()].slug === cleaned_hash;
            },
            four_oh_four_page_template_to_dom = () => {
                return new Promise((resolve, reject) => {
                load_and_empty_body();
                let four_oh_four_page_html_template = '<div class="row"><h3 class="col ms-fullwidth ms-text-center" id="title"></h3></div><div class="row"><div id="content"></div></div>';
                body_element.innerHTML = four_oh_four_page_html_template;
                if (body_element) {
                    resolve("404 Page Template Rendered");
                } else {
                    reject("404 Page Template Render Error");
                }
            })
            },
            four_oh_four_page = () => {
                four_oh_four_page_template_to_dom().then(() => {
                    document.title = "404";
                    let title = document.getElementById("title");
                    let content = document.getElementById("content");
                    if (get_current_locale() === "en-US") {
                        title.innerHTML = "Oops";
                        content.innerHTML = '<div class="ms-fullwidth ms-text-center">Hello, mate! This was probably a mistake<br><img src="images/mistake.gif"></div>';
                    } else
                    if (get_current_locale() === "es-ES") {
                        title.innerHTML = "Ups";
                        content.innerHTML = '<div class="ms-fullwidth ms-text-center">¡Hola! Esto probablemente fue un error<br><img src="images/fuesinquerer.gif"></div>';
                    }
                });
            };
            let handle_article_page = () => {
                let current_article_object = get_article_data().filter(find_slug)[0];
                if (current_article_object === undefined) {
                    four_oh_four_page();
                } else {
                    title_content_template_to_dom().then(() => {
                        let title = document.getElementById("title");
                        let content = document.getElementById("content");
                        let article_title = current_article_object.locales[get_current_locale()].title;
                        document.title = article_title;
                        title.innerHTML = article_title;
                        let subtitle_element = document.createElement("div");
                        subtitle_element.setAttribute("class", "col ms-fullwidth ms-text-center");
                        subtitle_element.setAttribute("id", "subtitle");
                        title.parentNode.parentNode.insertBefore(subtitle_element, title.parentNode.nextSibling);
                        let tags = current_article_object.locales[get_current_locale()].tags;
                        let subtitle_string = "";
                        if (tags.length > 0) {
                            tags.forEach((tag) => {
                                subtitle_string += '<a href="' + get_hash_vanity() + 'tags/' + tag + '"><button>' + tag + '</button></a>';
                            });
                        }
                        subtitle_string += "<p>";
                        let article_author_id = current_article_object.author;
                        let article_author = article_author_id === authors_array.filter((author_object => author_object.id === article_author_id))[0]?.id ? authors_array.filter((author_object => author_object.id === article_author_id))[0]?.name : article_author_id;
                        subtitle_string += "Author: " + article_author + " | " + current_article_object.date;
                        subtitle_string += "</p>";
                        let subtitle = document.getElementById("subtitle");
                        subtitle.innerHTML = subtitle_string;
                        content.innerHTML = current_article_object.locales[get_current_locale()].content;
                    });
                }
            },
            parse_url = () => {
                switch (get_current_url().hash) {
                    case get_hash_vanity() + "home":
                        handle_load_home_page();
                        break;
                    case "":
                        window.location.hash = get_hash_vanity() + "home";
                        break;
                    default:
                        if (get_current_url().hash.includes("tags/")) {
                            handle_tags_page();
                        } else {
                        handle_article_page();
                        }
                }
            },
            parse_flag = () => {
                let flag = document.getElementById("flag");
                if (get_current_locale() === "en-US") {
                    flag.src = "images/mexico_flag.png";
                    flag.parentElement.href = "https://articulos.rauluriartejr.com/";
                } else
                if (get_current_locale() === "es-ES") {
                    flag.src = "images/us_flag.png";
                    flag.parentElement.href = "https://articles.rauluriartejr.com/";
                }
            },
            handle_hash_change = () => {
                parse_url();
            },
            init_listeners = () => {
                window.addEventListener("hashchange", handle_hash_change);
                document.addEventListener("click", handle_click);
                document.addEventListener("submit", handle_submit);
            },
            trigger_mode = () => {
                if (localStorage.getItem('ruj_is_dark_mode') !== null) {
                } else {
                    localStorage.setItem("ruj_is_dark_mode", is_machine_dark);
                }
                localStorage.getItem('ruj_is_dark_mode') === "true" ? document.querySelector("html").setAttribute("data-theme", "dark") : document.querySelector("html").setAttribute("data-theme", "light");
            },
            init_functions = () => {
                init_listeners();
            };
            init_functions();
            parse_lang();
            trigger_mode();
            parse_url();
    };
    document.addEventListener("DOMContentLoaded", page_init);
})(window, document);