// eslint-disable-next-line no-undef
const MEDIA_BASE_URL = "/api";

export function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;

  if (data && typeof data === "object" && data.id) return [data];

  return [];
}

function getFileUrl(file) {
  if (!file) return "";

  if (typeof file === "string") return file;

  if (typeof file === "object") {
    return (
      file.url ||
      file.file ||
      file.image ||
      file.cover ||
      file.thumbnail ||
      ""
    );
  }

  return "";
}

export function resolveImageUrl(image, placeholder = "/images/placeholder.jpg") {
  const rawUrl = getFileUrl(image);

  if (!rawUrl) return placeholder;
  if (typeof rawUrl !== "string") return placeholder;

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  if (
    rawUrl.startsWith("/images/") ||
    rawUrl.startsWith("/img/") ||
    rawUrl.startsWith("/icons/")
  ) {
    return rawUrl;
  }

  if (rawUrl.startsWith("/")) {
    return `${MEDIA_BASE_URL}${rawUrl}`;
  }

  return `${MEDIA_BASE_URL}/${rawUrl}`;
}

export function resolveFileUrl(file) {
  const rawUrl = getFileUrl(file);

  if (!rawUrl) return "";
  if (typeof rawUrl !== "string") return "";

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  if (rawUrl.startsWith("/")) {
    return `${MEDIA_BASE_URL}${rawUrl}`;
  }

  return `${MEDIA_BASE_URL}/${rawUrl}`;
}

export function normalizePost(post) {
  if (!post) return null;

  const cover =
    post.cover_url ||
    post.cover?.url ||
    post.cover ||
    post.image_url ||
    post.image?.url ||
    post.image ||
    post.thumbnail_url ||
    post.thumbnail?.url ||
    post.thumbnail ||
    "";

  const videoFileRaw =
    post.video_file?.url ||
    post.video_file ||
    post.videoUrl ||
    post.video_url ||
    "";

  const audioFileRaw =
    post.audio_file?.url ||
    post.audio_file ||
    post.audioUrl ||
    post.audio_url ||
    "";

  return {
    ...post,

    id: post.id ?? null,
    title: post.title || "",
    slug: post.slug || "",
    href: post.slug ? `/news/${post.slug}` : "#",

    description: post.excerpt || post.summary || post.description || "",
    excerpt: post.excerpt || post.summary || post.description || "",
    content: post.content || "",

    image: resolveImageUrl(cover, "/images/placeholder.jpg"),
    cover: resolveImageUrl(cover, "/images/placeholder.jpg"),

    category: post.category?.title || post.category?.name || "",
    categorySlug: post.category?.slug || "",
    categoryHref: post.category?.slug ? `/category/${post.category.slug}` : "#",

    author: post.author?.full_name || post.author?.name || "",
    authorEmail: post.author?.email || "",
    authorAvatar: resolveImageUrl(
      post.author?.avatar ||
        post.author?.avatar_url ||
        post.author?.image ||
        "",
      "/images/placeholder-avatar.jpg"
    ),

    tags: Array.isArray(post.tags) ? post.tags : [],

    views: post.views || post.views_count || 0,
    viewsCount: post.views_count || post.views || 0,
    commentsCount: post.comments_count || 0,

    publishedAt: post.published_at || null,
    createdAt: post.created_at || null,
    updatedAt: post.updated_at || null,

    isBookmarked: Boolean(post.is_bookmarked),
    isFeatured: Boolean(post.is_featured),
    isHero: Boolean(post.is_hero),
    showOnHomepage: Boolean(post.show_on_homepage),

    postType: post.post_type || "",
    postTypeLabel: post.post_type_label || "",

    homepageSection: post.homepage_section || "",
    homepageSectionLabel: post.homepage_section_label || "",
    homepageOrder: post.homepage_order ?? 0,

    mediaType: post.media_type || post.mediaType || "none",
    media_type: post.media_type || post.mediaType || "none",

    mediaDuration: post.media_duration || post.mediaDuration || "",
    media_duration: post.media_duration || post.mediaDuration || "",

    videoFile: resolveFileUrl(videoFileRaw),
    video_file: resolveFileUrl(videoFileRaw),

    audioFile: resolveFileUrl(audioFileRaw),
    audio_file: resolveFileUrl(audioFileRaw),

    embedUrl: post.embed_url || post.embedUrl || "",
    embed_url: post.embed_url || post.embedUrl || "",
  };
}

export function normalizePosts(data) {
  return getList(data).map(normalizePost).filter(Boolean);
}

export function normalizeCategory(category) {
  if (!category) return null;

  return {
    ...category,
    id: category.id,
    title: category.title || category.name || "",
    label: category.title || category.name || "",
    slug: category.slug || "",
    value: category.slug || "",
    href: category.slug ? `/category/${category.slug}` : "#",
    postsCount: category.posts_count || 0,
    image: resolveImageUrl(
      category.image_url || category.image?.url || category.image || "",
      ""
    ),
  };
}

export function normalizeCategories(data) {
  return getList(data).map(normalizeCategory).filter(Boolean);
}

export function normalizeTag(tag) {
  if (!tag) return null;

  return {
    ...tag,
    id: tag.id,
    title: tag.title || tag.name || "",
    label: tag.title || tag.name || "",
    slug: tag.slug || "",
    value: tag.slug || "",
    href: tag.slug ? `/tag/${tag.slug}` : "#",
    postsCount: tag.posts_count || 0,
  };
}

export function normalizeTags(data) {
  return getList(data).map(normalizeTag).filter(Boolean);
}

export function normalizeVideo(video) {
  if (!video) return null;

  const thumbnail =
    video.thumbnail_url ||
    video.thumbnail?.url ||
    video.thumbnail ||
    video.cover_url ||
    video.cover?.url ||
    video.cover ||
    video.image_url ||
    video.image?.url ||
    video.image ||
    "";

  const videoFileRaw =
    video.video_file?.url ||
    video.video_file ||
    video.videoUrl ||
    video.video_url ||
    "";

  return {
    ...video,
    id: video.id,
    title: video.title || "",
    slug: video.slug || "",
    href: video.slug ? `/videos/${video.slug}` : "#",

    description: video.summary || video.description || "",
    summary: video.summary || video.description || "",
    content: video.content || "",

    image: resolveImageUrl(thumbnail, "/images/placeholder-video.jpg"),
    thumbnail: resolveImageUrl(thumbnail, "/images/placeholder-video.jpg"),

    videoUrl: resolveFileUrl(videoFileRaw),
    videoFile: resolveFileUrl(videoFileRaw),
    video_file: resolveFileUrl(videoFileRaw),

    embedUrl: video.embed_url || video.embedUrl || "",
    embed_url: video.embed_url || video.embedUrl || "",

    mediaType: video.media_type || video.mediaType || "video",
    media_type: video.media_type || video.mediaType || "video",

    duration:
      video.media_duration || video.mediaDuration || video.duration || 0,
    mediaDuration:
      video.media_duration || video.mediaDuration || video.duration || 0,

    views: video.views_count || video.views || 0,

    isFeatured: Boolean(video.is_featured),

    category: video.category?.title || video.category?.name || "",
    categorySlug: video.category?.slug || "",
    tags: Array.isArray(video.tags) ? video.tags : [],

    publishedAt: video.published_at,
  };
}

export function normalizeVideos(data) {
  return getList(data).map(normalizeVideo).filter(Boolean);
}

export function normalizePodcast(podcast) {
  if (!podcast) return null;

  const cover =
    podcast.cover_url ||
    podcast.cover_image?.url ||
    podcast.cover_image ||
    podcast.cover?.url ||
    podcast.cover ||
    podcast.image_url ||
    podcast.image?.url ||
    podcast.image ||
    "";

  const audioFileRaw =
    podcast.audio_file?.url ||
    podcast.audio_file ||
    podcast.audioUrl ||
    podcast.audio_url ||
    "";

  return {
    ...podcast,
    id: podcast.id,
    title: podcast.title || "",
    slug: podcast.slug || "",
    href: podcast.slug ? `/podcasts/${podcast.slug}` : "#",

    description: podcast.summary || podcast.description || "",
    summary: podcast.summary || podcast.description || "",
    content: podcast.content || "",

    image: resolveImageUrl(cover, "/images/placeholder-podcast.jpg"),
    cover: resolveImageUrl(cover, "/images/placeholder-podcast.jpg"),

    audioUrl: resolveFileUrl(audioFileRaw),
    audioFile: resolveFileUrl(audioFileRaw),
    audio_file: resolveFileUrl(audioFileRaw),

    embedUrl: podcast.embed_url || podcast.embedUrl || "",
    embed_url: podcast.embed_url || podcast.embedUrl || "",

    mediaType: podcast.media_type || podcast.mediaType || "podcast",
    media_type: podcast.media_type || podcast.mediaType || "podcast",

    duration:
      podcast.media_duration || podcast.mediaDuration || podcast.duration || 0,
    mediaDuration:
      podcast.media_duration || podcast.mediaDuration || podcast.duration || 0,

    listens: podcast.listens_count || podcast.listens || 0,

    isFeatured: Boolean(podcast.is_featured),

    category: podcast.category?.title || podcast.category?.name || "",
    categorySlug: podcast.category?.slug || "",
    tags: Array.isArray(podcast.tags) ? podcast.tags : [],

    publishedAt: podcast.published_at,
  };
}

export function normalizePodcasts(data) {
  return getList(data).map(normalizePodcast).filter(Boolean);
}

export function normalizeComment(comment) {
  if (!comment) return null;

  return {
    ...comment,
    id: comment.id ?? null,
    content: comment.content || "",
    createdAt: comment.created_at || null,
    updatedAt: comment.updated_at || null,
    author: comment.author || null,
    post: comment.post || null,
    status: comment.status || "",
  };
}

export function normalizeComments(data) {
  return getList(data).map(normalizeComment).filter(Boolean);
}

export function normalizeBookmark(bookmark) {
  if (!bookmark) return null;

  return {
    ...bookmark,
    id: bookmark.id ?? null,
    post: bookmark.post ? normalizePost(bookmark.post) : bookmark.post || null,
    createdAt: bookmark.created_at || null,
  };
}

export function normalizeBookmarks(data) {
  return getList(data).map(normalizeBookmark).filter(Boolean);
}

export function normalizePaginatedPosts(data) {
  return {
    count: Number(data?.count || 0),
    next: data?.next || null,
    previous: data?.previous || null,
    results: normalizePosts(data),
  };
}
