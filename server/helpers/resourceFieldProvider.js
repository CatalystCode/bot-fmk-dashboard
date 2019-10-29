// Template/Dashboard metadata is stored inside the files
// To read the metadata we could eval() the files, but that's dangerous.
// Instead, we use regular expressions to pull them out
// Assumes that:
// * the metadata comes before config information
// * fields in the file look like fieldname: "string" or fieldname: 'string'
// * or, special case, html: `string`

const fields = {
  id: /\s*id:\s*("|')(.*)("|')/,
  name: /\s*name:\s*("|')(.*)("|')/,
  description: /\s*description:\s*("|')(.*)("|')/,
  icon: /\s*icon:\s*("|')(.*)("|')/,
  logo: /\s*logo:\s*("|')(.*)("|')/,
  url: /\s*url:\s*("|')(.*)("|')/,
  preview: /\s*preview:\s*("|')(.*)("|')/,
  category: /\s*category:\s*("|')(.*)("|')/,
  html: /\s*html:\s*(`)([\s\S]*?)(`)/gm,
  featured: /\s*featured:\s*(true|false)/,
  connections: /\s*connections:( )([\S\s]*)(,)\s*layout:/
}

const MASK_STRING = '***********';
const MASKING_REQUIREMENTS = [
  'connections|application-insights|apiKey'
];

const getField = (fieldName, text) => {
  regExp = fields[fieldName];
  regExp.lastIndex = 0;

  const matches = regExp.exec(text);
  let match = matches && matches.length >= 3 && matches[2];
  if (!match) {
    match = matches && matches.length > 0 && matches[0];
  }
  return match;
}

const getMetadata = (text) => {
  const metadata = {}
  for (key in fields) {
    metadata[key] = getField(key, text);
  }
  return metadata;
}

module.exports = {
  getField,
  getMetadata,
  MASK_STRING,
  MASKING_REQUIREMENTS
}