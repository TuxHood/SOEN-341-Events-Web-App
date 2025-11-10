import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'
import { Calendar, Users, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section (full-bleed background) */}
      <section className="hero full-bleed">
        <div className="container">
          <h1 className="text-balance" style={{marginBottom:12}}>Campus Events Made Simple</h1>
          <p className="mt-4 max-w-3xl text-pretty text-muted-foreground" style={{margin:'0 auto'}}>
            Discover, manage, and attend campus events all in one place. Whether you&apos;re a student looking for events
            or an organizer hosting them, we&apos;ve got you covered.
          </p>
          <div className="cta-row" style={{marginTop:16}}>
            <Button asChild size="lg" style={{ color: "black" }}>
              <Link to="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features full-bleed" style={{ background: "white"}}>
        <div className="container">
          <h2 className="text-balance text-center text-center" style={{fontSize:'1.25rem', marginBottom:12}}>Everything you need for campus events</h2>
          <div className="features-grid">
            <div style={{textAlign:'center', padding: '8px 12px'}}>
              <div className="icon-chip bg-primary text-primary-foreground" style={{margin:'0 auto'}}>
                <Calendar style={{width:20,height:20}} />
              </div>
              <h3 style={{marginTop:10,fontWeight:700}}>For Students</h3>
              <p className="text-muted-foreground" style={{marginTop:6}}>Browse events, claim tickets, and get QR codes for easy check-in. Never miss out on campus activities.</p>
            </div>
            <div style={{textAlign:'center', padding: '8px 12px'}}>
              <div className="icon-chip bg-primary text-primary-foreground" style={{margin:'0 auto'}}>
                <Users style={{width:20,height:20}} />
              </div>
              <h3 style={{marginTop:10,fontWeight:700}}>For Organizers</h3>
              <p className="text-muted-foreground" style={{marginTop:6}}>Create and manage events, track attendance, and view analytics. Make your events successful.</p>
            </div>
            <div style={{textAlign:'center', padding: '8px 12px'}}>
              <div className="icon-chip bg-primary text-primary-foreground" style={{margin:'0 auto'}}>
                <Shield style={{width:20,height:20}} />
              </div>
              <h3 style={{marginTop:10,fontWeight:700}}>For Admins</h3>
              <p className="text-muted-foreground" style={{marginTop:6}}>Moderate events and organizations, view platform analytics, and ensure quality across the board.</p>
            </div>
          </div>
        </div>
      </section>

  {/* CTA Section */}
  <section className="cta-section full-bleed">
        <div className="container" style={{maxWidth: '900px', textAlign:'center'}}>
          <h2 className="text-balance text-3xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="text-muted-foreground" style={{ marginTop: 12, marginBottom: 10 }}>
            Join hundreds of students and organizers already using our platform
          </p>
          <Button asChild size="lg" style={{ marginTop: 28, color: "black" }}>
            <Link to="/auth/sign-up">Create Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}