function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")     // remove non-word
    .replace(/\s+/g, "-")         // spaces -> -
    .replace(/-+/g, "-");         // multiple - -> single
}

module.exports=slugify;