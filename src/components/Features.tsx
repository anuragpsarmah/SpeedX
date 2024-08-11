import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";
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
import { ResponsiveBar } from "@nivo/bar";

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

const optimalValues = {
  loadTime: 200,          // Aim for a fast load time, especially under 200 ms.
  requestSize: 1000000,   // Keeping request size under 1 MB is often a good practice.
  requestCount: 30,       // Reducing the number of requests can improve performance.
  ttfb: 100,              // A TTFB under 100 ms is considered excellent.
  fcp: 1500,              // First Contentful Paint ideally under 1.5 seconds.
  lcp: 2000,              // Largest Contentful Paint should be under 2 seconds.
  fid: 50,                // First Input Delay under 50 ms is ideal for responsiveness.
  tti: 3000,              // Time to Interactive ideally under 3 seconds.
  cls: 0.1,               // Cumulative Layout Shift under 0.1 is a good target.
};

export const Features = () => {
  const { theme } = useTheme();
  const [website, setWebsite] = useState("");
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [geminiResponse, setGeminiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const inputColor = theme === "light" ? "grey" : "white";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsite(e.target.value);
  };

  const convertResponseToString = (data: WebsiteData): string => {
    const formatNumber = (num: number | null): string => {
      return num !== null ? `${Math.round(num * 100) / 100}` : "N/A";
    };

    const formattedData = [
      `Load Time: ${
        data.loadTime !== null ? `${formatNumber(data.loadTime)} ms` : "N/A"
      }`,
      `Request Size: ${
        data.requestSize !== null ? `${data.requestSize} bytes` : "N/A"
      }`,
      `Request Count: ${
        data.requestCount !== null ? data.requestCount : "N/A"
      }`,
      `Time to First Byte (TTFB): ${
        data.ttfb !== null ? `${formatNumber(data.ttfb)} ms` : "N/A"
      }`,
      `First Contentful Paint (FCP): ${
        data.fcp !== null ? `${formatNumber(data.fcp)} ms` : "N/A"
      }`,
      `Largest Contentful Paint (LCP): ${
        data.lcp !== null ? `${formatNumber(data.lcp)} ms` : "N/A"
      }`,
      `First Input Delay (FID): ${
        data.fid !== null ? `${formatNumber(data.fid)} ms` : "N/A"
      }`,
      `Time to Interactive (TTI): ${
        data.tti !== null ? `${formatNumber(data.tti)} ms` : "N/A"
      }`,
      `Cumulative Layout Shift (CLS): ${
        data.cls !== null ? formatNumber(data.cls) : "N/A"
      }`,
    ];

    return formattedData.join(", ");
  };

  const handleAnalyseClick = async () => {
    if (website) {
      const urlPattern =
        /^(https?:\/\/)?([a-z0-9.-]+)\.([a-z]{2,6})([\/\w .-]*)*\/?$/i;
      if (urlPattern.test(website)) {
        setIsLoading(true);
        try {
          const response = await axios.post(`${import.meta.env.VITE_ANALYZE_ENDPOINT}/analyze`, {
            url: website,
          });

          if (response.status === 200) {
            const resultString = convertResponseToString(response.data);
            const geminiApiResponse = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
                import.meta.env.VITE_GEMINI_API_KEY
              }`,
              {
                contents: [
                  {
                    parts: [
                      {
                        text: `Here are the website performance metrics for a website: ${resultString} GIVE ME POINTS OF INSIGHTS FOR EACH OF THESE METRICS. NO INTRODUCTION/CONCLUSION. BE PRECISE AND CRISP. DON'T ADD ANY TEXT DECORATION OR FORMATTING. GIVE THE OUTPUT STRICTLY IN THE FORMAT: INSIGHTS SEPARATED BY '\n'. Example: "Load Time of 358.43ms suggests website is loading relatively quickly.\n...`,
                      },
                    ],
                  },
                ],
              }
            );

            const insights =
              geminiApiResponse.data.candidates[0].content.parts[0].text;
            setGeminiResponse(insights);
            setWebsiteData(response.data);
          }
        } catch (error: any) {
          if (error.response) {
            const statusCode = error.response.status;

            if (statusCode === 429) {
              toast({
                title: "Rate Limit Exceeded",
                description: "Too many requests. Please try again later.",
              });
            } else if (statusCode === 500) {
              toast({
                title: "Server Error",
                description:
                  "There was an issue analyzing the website. Please try again later.",
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
              description:
                "No response from the server. Please check your connection.",
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

  const MetricChart = ({
    metric,
    current,
    optimal,
  }: {
    metric: string;
    current: number | null;
    optimal: number;
  }) => {
    const formattedCurrent = typeof current === "number" ? parseFloat(current.toFixed(2)) : 0;
  
    return (
      <div className="h-64 w-full">
        <ResponsiveBar
          data={[
            {
              metric: "Current",
              value: formattedCurrent,
            },
            {
              metric: "Optimal",
              value: optimal,
            },
          ]}
          keys={["value"]}
          indexBy="metric"
          margin={{ top: 10, right: 10, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={({ id }) => (id === "Current" ? "#6366f1" : "#22c55e")}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            tickColor: "white",
            legend: metric,
            legendPosition: "middle",
            legendOffset: 40,
            legendTextColor: "white",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            tickColor: "white",
            legendPosition: "middle",
            legendOffset: -50,
            legendTextColor: "white",
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: "white",
                },
              },
              legend: {
                text: {
                  fill: "white",
                },
              },
            },
          }}
          role="application"
          ariaLabel={`${metric} chart`}
          barAriaLabel={(e) => `${e.id}: ${e.formattedValue} for ${e.indexValue}`}
        />
      </div>
    );
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
        <Button
          onClick={handleAnalyseClick}
          className="mt-4"
          disabled={isLoading}
        >
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
                <h3 className="text-lg font-bold">
                  {fullFormMap[key as keyof typeof fullFormMap]}
                </h3>
                <span className="text-3xl text-primary dark:text-primary-dark">
                  {iconMap[key as keyof typeof iconMap]}
                </span>
              </div>
              <p className="text-2xl font-bold mt-4">
                {value !== null
                  ? key === "loadTime" ||
                    key === "ttfb" ||
                    key === "fcp" ||
                    key === "lcp" ||
                    key === "fid" ||
                    key === "tti"
                    ? `${Number(value).toFixed(2)} ms`
                    : key === "requestSize"
                    ? `${Number(value).toLocaleString()} bytes`
                    : key === "requestCount"
                    ? value.toString()
                    : key === "cls"
                    ? Number(value).toFixed(4)
                    : typeof value === "number"
                    ? value.toFixed(2)
                    : value
                  : "-"}
              </p>
            </div>
          ))}
        </div>
      )}

      {websiteData && (
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(websiteData).map(([key, value]) => (
            <MetricChart
              key={key}
              metric={fullFormMap[key as keyof typeof fullFormMap]}
              current={value}
              optimal={optimalValues[key as keyof typeof optimalValues]}
            />
          ))}
        </div>
      )}

      <br></br>

      {geminiResponse && (
        <div className="mt-8 p-6 bg-white dark:bg-gray-900 rounded-md shadow-lg">
          <h3 className="text-lg font-bold text-primary dark:text-primary-light mb-4">
            Performance Insights:
          </h3>
          <ul className="list-disc list-inside space-y-2">
            {geminiResponse
              .split("\n")
              .filter((insight) => insight.trim() !== "")
              .map((insight, index) => (
                <li
                  key={index}
                  className="text-md text-gray-800 dark:text-gray-300 leading-relaxed"
                >
                  {insight}
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
};
