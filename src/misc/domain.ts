import { URL } from './url'
export { URL, ParsedURL } from './url'
export type InjecteesFilepath = string

// string pattern for URLs with substitutions
type Pattern = string
type RegexpPattern = string

export type HashFilterManifest = {
  hash: {
    urls: Pattern[]
  }
}

export type RegFilterManifest = {
  reg?: {
    pattern: RegexpPattern
  }
}

export type FilterManifest = HashFilterManifest
  | RegFilterManifest
  | HashFilterManifest & RegFilterManifest

export type ResourceDescriptor = {
  versions?: string[],
  urls: URL[],
  file: string
}

export type ResourceMap = {
  [resourceCDNURI in URL]: InjecteesFilepath | boolean
}

export type RegExpMap = {
  [regexpPattern in RegexpPattern]: InjecteesFilepath
}

type HashConfig = {
  [resourceName in string]: ResourceDescriptor
}
