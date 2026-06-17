import { GlowCard } from "@/components/glow-card"

const projects = [
  { 
    name: "Bump4You", 
    description: "Discord Bump Bot", 
    link: "https://www.bump4you.com", 
    available: true,
    image: "/images/bump4you.png",
  },
]

export function PartnersSection() {
  return (
    <section id="partners" className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Our <span className="text-primary">Projects</span>
          </h2>
          <p className="text-foreground max-w-2xl mx-auto">
            Check out our other projects and tools we are working on.
          </p>
        </div>

        <div className="flex justify-center">
          {projects.map((project) => (
            <a
              key={project.name}
              href={project.available ? project.link : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] ${project.available ? "cursor-pointer" : "cursor-default"}`}
            >
              <GlowCard
                className={`w-full h-full flex flex-col items-center justify-center transition-all duration-300 ${project.available ? "border-primary shadow-[0_0_50px_rgba(34,197,94,0.3)] hover:shadow-[0_0_70px_rgba(34,197,94,0.4)] hover:scale-105" : ""}`}
              >
                <img 
                  src={project.image} 
                  alt={`${project.name} logo`}
                  className="w-20 h-20 sm:w-32 sm:h-32 rounded-lg object-cover mb-4 sm:mb-6"
                />
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{project.name}</h3>
              </GlowCard>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
