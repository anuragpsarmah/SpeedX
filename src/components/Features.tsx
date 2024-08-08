import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast"
import { FaSpinner } from "react-icons/fa";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import axios from "axios";
import {
  FaClock,
  FaFileAlt,
  FaNetworkWired,
  FaTachometerAlt,
  FaServer,
  FaPaintBrush,
  FaImages,
  FaMousePointer,
  FaHandPointer,
  FaMap,
} from "react-icons/fa";

const featureList: string[] = [
  "Page Load Time",
  "Total Request Size",
  "Number of Requests",
  "Speed Index",
  "Time to First Byte (TTFB)",
  "First Contentful Paint (FCP)",
  "Largest Contentful Paint (LCP)",
  "First Input Delay (FID)",
  "Time to Interactive (TTI)",
  "Cumulative Layout Shift (CLS)",
];

interface WebsiteData {
  loadTime: number | null;
  requestSize: number | null;
  requestCount: number | null;
  speedIndex: number | null;
  ttfb: number | null;
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  tti: number | null;
  cls: number | null;
}

const iconMap: { [key: string]: JSX.Element } = {
  loadTime: <FaClock />,
  requestSize: <FaFileAlt />,
  requestCount: <FaNetworkWired />,
  speedIndex: <FaTachometerAlt />,
  ttfb: <FaServer />,
  fcp: <FaPaintBrush />,
  lcp: <FaImages />,
  fid: <FaMousePointer />,
  tti: <FaHandPointer />,
  cls: <FaMap />,
};

const fullFormMap: { [key: string]: string } = {
  loadTime: "Page Load Time",
  requestSize: "Total Request Size",
  requestCount: "Number of Requests",
  speedIndex: "Speed Index",
  ttfb: "Time to First Byte (TTFB)",
  fcp: "First Contentful Paint (FCP)",
  lcp: "Largest Contentful Paint (LCP)",
  fid: "First Input Delay (FID)",
  tti: "Time to Interactive (TTI)",
  cls: "Cumulative Layout Shift (CLS)",
};

export const Features = () => {
  const { theme } = useTheme();
  const [website, setWebsite] = useState("");
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()

  const inputColor = theme === "light" ? "grey" : "white";

  const handleInputChange = (e: any) => {
    setWebsite(e.target.value);
  };

  const handleAnalyseClick = async () => {
    if (website) {
      const urlPattern = /^(https?:\/\/)?([a-z0-9.-]+)\.([a-z]{2,6})([\/\w .-]*)*\/?$/i;
      if (urlPattern.test(website)) {
        setIsLoading(true);
        try {
          const response = await axios.post("http://localhost:3000/analyze", { url: website });
  
          if (response.status === 200) {
            setWebsiteData(response.data);
          }
        } catch (error: any) {
          if (error.response) {
            const statusCode = error.response.status;
  
            if (statusCode === 429) { // Rate limiter error
              toast({
                title: "Rate Limit Exceeded",
                description: "Too many requests. Please try again later.",
              });
            } else if (statusCode === 500) {
              toast({
                title: "Server Error",
                description: "There was an issue analyzing the website. Please try again later.",
              });
            } else {
              toast({
                title: "Error",
                description: "An unexpected error occurred.",
              });
            }
          } else if (error.request) {
            toast({
              title: "Network Error",
              description: "No response from the server. Please check your connection.",
            });
          } else {
            toast({
              title: "Error",
              description: "An error occurred while analyzing the website.",
            });
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL.",
        });
      }
    } else {
      toast({
        title: "Input Required",
        description: "Please enter a website link.",
      });
    }
  };

  return (
    <section id="features" className="container py-24 sm:py-32 space-y-8">
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Website{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Performance Analytics
        </span>
      </h2>

      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge variant="secondary" className="text-sm">
              {feature}
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Input
          type="url"
          placeholder="Enter your website link"
          value={website}
          onChange={handleInputChange}
          className="w-full md:w-1/2 mr-4 mt-4 border-white"
          style={{ borderColor: inputColor }}
        />
        <Button onClick={handleAnalyseClick} className="mt-4" disabled={isLoading}>
          {isLoading ? <FaSpinner className="animate-spin" /> : "Analyse"}
        </Button>
      </div>

      {websiteData && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(websiteData).map(([key, value]) => (
            <div
              key={key}
              className="bg-card dark:bg-card-dark p-6 rounded-md shadow-md dark:shadow-none transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{fullFormMap[key]}</h3>
                <span className="text-3xl text-primary dark:text-primary-dark">
                  {iconMap[key]}
                </span>
              </div>
              <p className="text-2xl font-bold mt-4">
                {value !== null && typeof value === "number"
                  ? key.includes("Time") || key === "ttfb" || key === "speedIndex"
                    ? `${value.toFixed(2)} ms`
                    : value.toFixed(2)
                  : "-"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
