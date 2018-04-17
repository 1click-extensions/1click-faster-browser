import { ParsedURL, ResourceMap } from '../misc/domain'
import { ALLOW_REQUEST_TOKEN } from "../misc/requestInterceptor"
import { redirect } from '../misc/requestInterceptor'

// todo generate proper filter
const resourceMap: ResourceMap = {
  "ajax.aspnetcdn.com/ajax/jQuery/jquery-1.4.1.min.js":"injectees/jquery/1.4.1/jquery.min.js"
}

const hasMappedResource = (uri: string) =>
  resourceMap[uri] !== undefined

export const check = (parsedURL: ParsedURL, tabId: number) => {
  if (parsedURL.isExtension) return

  // url totally match the library + version + cdn address
  if (hasMappedResource(parsedURL.uri)){
    parsedURL.boostedBy = 'hash'

    return redirect(
      resourceMap[parsedURL.uri] as string,
      tabId,
      parsedURL
    )

  } else {
    return ALLOW_REQUEST_TOKEN
  }
}
