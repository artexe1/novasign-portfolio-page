import BioGraph from '../components/BioGraph'
import ProductionFlow from '../components/ProductionFlow'
import ThinkingBulb from '../components/ThinkingBulb'

const REASONS = [
  {
    num: 'I',
    kicker: 'The science is the job',
    title: 'Biotech foundation',
    body: 'MSc in Biotechnology (Bioinformatics) with experience at the Kurchatov Institute Genomic Centre, writing about metagenomics, gene editing, and recombinant proteins for public and institutional audiences. The science is not background reading; it is the job.',
    Visual: BioGraph,
  },
  {
    num: 'II',
    kicker: 'Brief to published, one workflow',
    title: 'Full-stack content production',
    body: 'From a hybrid-model brief to a published Facebook and Instagram post, a slide deck, and a product one-pager, without a hand-off queue. Copy, layout, visual asset, and deadline managed in one workflow.',
    Visual: ProductionFlow,
  },
  {
    num: 'III',
    kicker: 'Tools, not experiments',
    title: 'AI-augmented by default',
    body: 'Daily use of Claude, ChatGPT, Midjourney, and Perplexity as production tools, not experiments. Faster first drafts, consistent visual output, and the judgment to know when the model is wrong about the biology.',
    Visual: ThinkingBulb,
  },
]

export default function WhyHer() {
  return (
    <section className="why" aria-labelledby="why-heading">
      <div className="container">
        <h2 className="section-heading" id="why-heading" data-reveal>The case for hiring me</h2>

        <div className="why-rows">
          {REASONS.map(({ num, kicker, title, body, Visual }, i) => (
            <article key={num} className="why-row" data-flip={i % 2 === 1} data-reveal>
              <div className="why-visual">
                <Visual />
              </div>
              <div className="why-body">
                <span className="why-num" aria-hidden="true">{num}</span>
                <p className="why-kicker">{kicker}</p>
                <h3 className="why-title">{title}</h3>
                <p className="why-text">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
