import {
  transform,
  parse,
  querySelector,
  querySelectorAll,
  sanitize,
} from '../util/ultrahtml'

export const config = {
  runtime: 'edge',
}

type Abbreviation = {
  term: string
  definition: string
  category: string
  rating: number
}

export default async (req: Request, res: Response) => {
  const searchParams = new URLSearchParams(req.url.split('?')[1])
  const term = searchParams.get('term')

  const markup = await fetch(
    `https://www.abbreviations.com/abbreviation/${term}`
  ).then((res) => res.text())

  const doc = await parse(markup)

  const trNodes = querySelectorAll(doc, `table.tdata tr`)

  const getTextContent = (node) => node.children?.[0].value

  let abbreviations: Abbreviation[] = []

  for (const node of trNodes) {
    const q = (selector) => querySelector(node, selector)

    const termNode = q('.tal.tm.fsl a')
    const dfnNode = q('.tal.dx.fsl p.desc')
    const cateNode = q('.tal.dx.fsl p.path')
    const rateNode = q('.sc.rate-stars')

    if (!cateNode || !termNode || !dfnNode || !rateNode) continue

    const cateHTML = await transform(cateNode, [
      sanitize({
        blockElements: ['a'],
      }),
    ])

    const starNodes = querySelectorAll(rateNode, '.sf')

    const term = getTextContent(termNode)
    const dfn = getTextContent(dfnNode)
    const cate = getTextContent(parse(cateHTML).children[0])
    const rating = starNodes.length

    abbreviations.push({
      term: term,
      definition: dfn,
      category: cate,
      rating: rating,
    })
  }

  return new Response(JSON.stringify(abbreviations), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
