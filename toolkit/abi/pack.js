// src/sets/pack.ts
var PACK_FORMAT_VERSION = 2;
var SUPPORTED_PACK_FORMATS = [1, 2];
var PLATFORM_ABI = 1;
var PACK_EXT = ".fbkset";
var REQUIRED_PACK_FILES = ["manifest.json", "set.js"];
function packProvides(manifest, what) {
  return (manifest.provides ?? ["theme"]).includes(what);
}
function requiredPackFiles(manifest) {
  return [...REQUIRED_PACK_FILES, ...packProvides(manifest, "theme") ? ["set.css"] : []];
}
function signingPayload(digests) {
  return Object.entries(digests).filter(([file]) => file !== "signature.json").map(([file, hash]) => `${file}	${hash}`).sort().join("\n");
}
var ID_RE = /^[a-z][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)*[a-z0-9]$/;
var ID_MAX = 40;
var SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9a-z.-]+)?$/i;
function reservedIds(builtIn) {
  return new Set(builtIn);
}
function majorOf(version) {
  const m = SEMVER_RE.exec(version);
  return m ? Number(m[1]) : 0;
}
function compareVersions(a, b) {
  const pa = SEMVER_RE.exec(a);
  const pb = SEMVER_RE.exec(b);
  if (!pa || !pb) return a.localeCompare(b);
  for (let i = 1; i <= 3; i++) {
    const d = Number(pa[i]) - Number(pb[i]);
    if (d !== 0) return d;
  }
  return 0;
}
function manifestProblems(value, builtIn = []) {
  const out = [];
  if (typeof value !== "object" || value === null) return ["manifest.json is not an object"];
  const m = value;
  if (!SUPPORTED_PACK_FORMATS.includes(m.formatVersion)) {
    out.push(
      `manifest formatVersion is ${String(m.formatVersion)}, this app reads ` + SUPPORTED_PACK_FORMATS.join(" and ")
    );
  }
  if (typeof m.id !== "string" || !ID_RE.test(m.id) || m.id.length > ID_MAX) {
    out.push(
      `"${String(m.id)}" is not a usable extension id \u2014 lowercase letters, digits and dashes, optionally as publisher.name, at most ${ID_MAX} characters`
    );
  } else if (reservedIds(builtIn).has(m.id)) {
    out.push(`"${m.id}" is the id of a theme built into the app`);
  }
  if (typeof m.name !== "string" || m.name.trim() === "") out.push("manifest has no name");
  if (typeof m.version !== "string" || !SEMVER_RE.test(m.version)) {
    out.push(`"${String(m.version)}" is not a version number (e.g. 1.0.0)`);
  }
  if (m.platformAbi !== PLATFORM_ABI) {
    out.push(
      `theme was built for platform ${String(m.platformAbi)}; this app provides ${PLATFORM_ABI}`
    );
  }
  for (const t of m.templates ?? []) {
    if (typeof t?.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(t.id)) {
      out.push(`"${String(t?.id)}" is not a usable template id`);
    }
  }
  if (m.provides !== void 0) {
    if (!Array.isArray(m.provides) || m.provides.length === 0) {
      out.push('manifest "provides" must be a non-empty array of "theme" / "components"');
    } else {
      for (const p of m.provides) {
        if (p !== "theme" && p !== "components") {
          out.push(`"${String(p)}" is not something a pack can provide`);
        }
      }
    }
  }
  const providesComponents = (m.provides ?? ["theme"]).includes("components");
  if (providesComponents && !(Array.isArray(m.components) && m.components.length > 0)) {
    out.push("the pack claims to provide components but declares none");
  }
  for (const c of m.components ?? []) {
    if (typeof c?.kind !== "string" || !c.kind.startsWith(`${String(m.id)}/`)) {
      out.push(
        `component kind "${String(c?.kind)}" must be namespaced by the pack id ("${String(m.id)}/\u2026")`
      );
    } else if (!/^[a-z][a-z0-9.-]*\/[a-z][a-z0-9-]*$/.test(c.kind)) {
      out.push(`"${c.kind}" is not a usable component kind (lowercase letters, digits, dashes)`);
    }
  }
  return out;
}
function installedSetOf(manifest, extra) {
  return {
    id: manifest.id,
    name: manifest.name,
    ...manifest.description ? { description: manifest.description } : {},
    version: manifest.version,
    ...manifest.publisher ? { publisher: manifest.publisher } : {},
    ...manifest.production ? { production: true } : {},
    ...manifest.swatch ? { swatch: manifest.swatch } : {},
    ...manifest.templates?.length ? { templates: manifest.templates } : {},
    ...manifest.layoutDescriptions ? { layoutDescriptions: manifest.layoutDescriptions } : {},
    ...manifest.provides ? { provides: manifest.provides } : {},
    ...manifest.components?.length ? { components: manifest.components } : {},
    ...manifest.pptxSafe === false ? { pptxSafe: false } : {},
    trust: extra.trust,
    base: `/sets/${manifest.id}`,
    installedAt: extra.installedAt,
    ...extra.hasGuide ? { hasGuide: true } : {}
  };
}
export {
  PACK_EXT,
  PACK_FORMAT_VERSION,
  PLATFORM_ABI,
  REQUIRED_PACK_FILES,
  SUPPORTED_PACK_FORMATS,
  compareVersions,
  installedSetOf,
  majorOf,
  manifestProblems,
  packProvides,
  requiredPackFiles,
  reservedIds,
  signingPayload
};
