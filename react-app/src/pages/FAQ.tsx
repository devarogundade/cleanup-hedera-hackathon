import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, HelpCircle, Zap, Wallet, Shield, 
  Globe, Trophy, Gift, MessageCircle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES, SOCIAL_LINKS } from "@/data/constants";

const FAQ = () => {
  const navigate = useNavigate();

  const faqCategories = [
    {
      category: "Getting Started",
      icon: Zap,
      color: "text-blue-500",
      questions: [
        {
          q: "What is CleanUp and how does it work?",
          a: "CleanUp is a gamified environmental impact platform built on Hedera blockchain. You can donate to cleanup rounds by purchasing fractions of cleanup zones, vote for NGOs, and receive unique NFTs as proof of your contribution. Each donation earns you XP and helps you level up while making real environmental impact."
        },
        {
          q: "Do I need cryptocurrency to participate?",
          a: "Yes, you need HBAR (Hedera's native cryptocurrency) to make donations. If you don't have HBAR, you can purchase it from exchanges like Binance, Coinbase, or directly through supported wallets. Don't worry - we provide a step-by-step guide to help you get started!"
        },
        {
          q: "How do I connect my wallet?",
          a: "We support HashPack and other Hedera-compatible wallets. Simply click the 'Connect Wallet' button, choose your wallet provider, and approve the connection. The entire process takes less than 2 minutes. If you don't have a wallet, we'll guide you through creating one."
        },
        {
          q: "Is there a minimum donation amount?",
          a: "Yes, the minimum donation varies by round but typically starts at around 0.01-0.02 HBAR per fraction. This ensures that transaction fees remain proportional to donations and maximizes the impact of your contribution."
        }
      ]
    },
    {
      category: "Donations & Transactions",
      icon: Wallet,
      color: "text-green-500",
      questions: [
        {
          q: "How are my donations used?",
          a: "100% of your donation goes directly to environmental cleanup efforts. The winning NGO (chosen by community vote) receives the funds to execute the cleanup at the specified location. All transactions are transparent and recorded on the Hedera blockchain for full accountability."
        },
        {
          q: "What are the transaction fees?",
          a: "Thanks to Hedera's efficient network, transaction fees are incredibly low - only $0.0001 per transaction. This means virtually all of your donation goes to environmental impact, not gas fees!"
        },
        {
          q: "How long does a transaction take?",
          a: "Transactions on Hedera are lightning fast! Your donation will be confirmed in just 3-5 seconds with instant finality. You'll see your NFT and XP rewards immediately after confirmation."
        },
        {
          q: "Can I donate to multiple fractions at once?",
          a: "Absolutely! You can select as many fractions as you want from the visualization map and complete them all in a single transaction. This is more efficient and earns you bonus XP for bulk donations."
        },
        {
          q: "Are donations refundable?",
          a: "Due to the blockchain nature of transactions and immediate NFT minting, donations are non-refundable. However, all funds are transparently tracked and used exactly as described for environmental cleanup."
        }
      ]
    },
    {
      category: "NFTs & Rewards",
      icon: Gift,
      color: "text-purple-500",
      questions: [
        {
          q: "What NFTs do I receive?",
          a: "Each fraction you donate generates a unique NFT that represents your ownership of that specific cleanup zone. These NFTs serve as proof of your environmental contribution and can be viewed in your wallet or on NFT marketplaces."
        },
        {
          q: "How does the XP and leveling system work?",
          a: "You earn 10 XP for each fraction donated. As you accumulate XP, you level up and unlock achievements, special badges, and potentially access to exclusive rounds. Check the Rewards page to see all available achievements!"
        },
        {
          q: "Can I trade or sell my NFTs?",
          a: "Yes! Your cleanup NFTs are standard Hedera tokens that can be traded on NFT marketplaces. Some collectors value these as proof of environmental action, creating a secondary market for impact NFTs."
        },
        {
          q: "What are the special achievements?",
          a: "We have various achievements like 'First Impact' (first donation), 'Eco Warrior' (25+ donations), 'Planet Hero' (100+ donations), and more. Each achievement comes with bonus XP and exclusive badges to display on your profile."
        },
        {
          q: "Do NFTs have any utility beyond collectibles?",
          a: "Yes! NFT holders may get early access to new rounds, voting weight multipliers, and special access to physical rewards. We're constantly adding new utilities to reward our most dedicated contributors."
        }
      ]
    },
    {
      category: "Voting & NGOs",
      icon: Trophy,
      color: "text-amber-500",
      questions: [
        {
          q: "How does NGO voting work?",
          a: "After donating to a round, you receive voting power. You can cast your vote for one of the participating NGOs. The NGO with the most votes at the end of the round receives all donations to execute the cleanup project."
        },
        {
          q: "How are NGOs selected and verified?",
          a: "All NGOs on our platform are carefully vetted for their environmental track record, transparency, and execution capabilities. We work only with registered non-profits that have demonstrated success in environmental cleanup projects."
        },
        {
          q: "Can I change my vote?",
          a: "Once submitted, votes are recorded on the blockchain and cannot be changed. This ensures the integrity of the voting process. Choose carefully!"
        },
        {
          q: "What happens if my chosen NGO doesn't win?",
          a: "Your donation still contributes to environmental impact - it goes to the winning NGO to execute the cleanup. You still receive your NFTs, XP, and all rewards regardless of which NGO wins."
        }
      ]
    },
    {
      category: "Technical & Security",
      icon: Shield,
      color: "text-red-500",
      questions: [
        {
          q: "Why is CleanUp built on Hedera?",
          a: "Hedera is the most sustainable and efficient blockchain, making it perfect for environmental projects. It's carbon-negative, has instant transaction finality (3-5 seconds), incredibly low fees ($0.0001), and can handle 10,000+ transactions per second. It practices what we preach!"
        },
        {
          q: "Is my wallet and data secure?",
          a: "Absolutely. We never have access to your private keys - all transactions are signed directly in your wallet. Hedera's aBFT consensus provides bank-grade security. We also use industry-standard encryption for any data we store."
        },
        {
          q: "How is transparency ensured?",
          a: "Every transaction, donation, vote, and NGO payout is recorded on the Hedera blockchain, which is publicly viewable. You can verify any transaction using the contract address and transaction ID."
        },
        {
          q: "What if I encounter a technical issue?",
          a: "Our support team is available 24/7 through Discord and email. We also have detailed documentation and video tutorials. Most issues can be resolved quickly - common ones include wallet connection problems (usually fixed by refreshing) or network congestion (wait a few minutes)."
        }
      ]
    },
    {
      category: "Impact & Verification",
      icon: Globe,
      color: "text-cyan-500",
      questions: [
        {
          q: "How can I verify the real-world impact?",
          a: "We provide regular photo updates, progress reports, and completion certificates from NGOs. Each round's page shows before/after photos, amount of waste collected, and impact metrics. Everything is documented and publicly available."
        },
        {
          q: "What happens after a round ends?",
          a: "The winning NGO has a set timeframe to execute the cleanup. They provide regular updates and final documentation. Once complete, the round is marked as finished and detailed impact reports are published. You can view all historical rounds and their outcomes."
        },
        {
          q: "How often are new rounds created?",
          a: "We typically launch a new round every 4-6 weeks. Each round focuses on a different location and may alternate between ocean cleanup and tree planting initiatives. Follow us on social media or check the app regularly for new rounds!"
        },
        {
          q: "Can I suggest a location for cleanup?",
          a: "Yes! We welcome community suggestions. Join our Discord or use the contact form to propose locations. We evaluate suggestions based on environmental impact potential, accessibility for NGOs, and community interest."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-[60px] sm:h-[70px] flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Link to={ROUTES.APP_ROUND(5)}>
            <Button variant="default" className="gap-2 bg-gradient-primary border-0">
              Launch App
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help Center
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-foreground px-4 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Find answers to common questions about CleanUp. Can't find what you're looking for? 
            Reach out to our support team! 💬
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8 sm:space-y-12 mb-12 sm:mb-16">
          {faqCategories.map((category, categoryIndex) => (
            <div 
              key={categoryIndex}
              className="animate-fade-in"
              style={{ animationDelay: `${categoryIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center`}>
                  <category.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${category.color}`} />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  {category.category}
                </h2>
              </div>

              <Card className="overflow-hidden border-2">
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, index) => (
                    <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                      <AccordionTrigger className="px-4 sm:px-6 py-4 text-left hover:no-underline hover:bg-muted/50 transition-colors">
                        <span className="text-sm sm:text-base lg:text-lg font-semibold text-foreground pr-4">
                          {item.q}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-6 pb-4 text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          ))}
        </div>

        {/* Contact Support Section */}
        <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-primary" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
            Still Have Questions?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Our support team is here to help! Join our Discord community for instant answers 
            or reach out through our social channels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={SOCIAL_LINKS.DISCORD} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-primary border-0">
                <MessageCircle className="w-5 h-5" />
                Join Discord
              </Button>
            </a>
            <a href={SOCIAL_LINKS.TWITTER} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Globe className="w-5 h-5" />
                Follow on Twitter
              </Button>
            </a>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default FAQ;
