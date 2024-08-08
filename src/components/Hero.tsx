import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ResponsiveRadar } from "@nivo/radar";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

const initialData = [
  { metric: "Load Time (s)", desktop: 0, mobile: 0, tablet: 0 },
  { metric: "Request Size (MB)", desktop: 0, mobile: 0, tablet: 0 },
  { metric: "Number of Requests", desktop: 0, mobile: 0, tablet: 0 },
  { metric: "Time to Interactive (s)", desktop: 0, mobile: 0, tablet: 0 },
  { metric: "First Contentful Paint (s)", desktop: 0, mobile: 0, tablet: 0 },
];

const finalData = [
  { metric: "Load Time (s)", desktop: 50, mobile: 80, tablet: 70 },
  { metric: "Request Size (MB)", desktop: 30, mobile: 60, tablet: 80 },
  { metric: "Number of Requests", desktop: 70, mobile: 50, tablet: 60 },
  { metric: "Time to Interactive (s)", desktop: 40, mobile: 70, tablet: 90 },
  { metric: "First Contentful Paint (s)", desktop: 60, mobile: 40, tablet: 50 },
];

export const Hero = () => {
  const { theme } = useTheme();
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(finalData);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const textColor = theme === "light" ? "black" : "white";
  const circleColor = theme === "light" ? "grey" : "grey";

  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
              Speed
            </span>
            X
          </h1>
          <br></br>
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              Performance
            </span>{" "}
            Analysis
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Detailed Website Performance Metrics with SpeedX.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <a href="/#features">
            <Button className="w-full md:w-1/3">Get Started</Button>
          </a>

          <a
            rel="noreferrer noopener"
            href="https://github.com/anuragpsarmah"
            target="_blank"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: "outline",
            })}`}
          >
            Github Repository
            <GitHubLogoIcon className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Hero Chart sections */}
      <div className="z-10 w-full max-w-[640px]">
        <div className="w-full h-[450px]">
          <ResponsiveRadar
            data={data}
            keys={["desktop", "mobile", "tablet"]}
            indexBy="metric"
            maxValue="auto"
            valueFormat=">-.2f"
            margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
            borderColor={{ from: "color" }}
            gridLabelOffset={36}
            dotSize={10}
            dotColor={{ theme: "background" }}
            dotBorderWidth={2}
            colors={{ scheme: "nivo" }}
            blendMode="multiply"
            motionConfig="wobbly"
            theme={{
              text: {
                fill: textColor,
              },
              axis: {
                ticks: {
                  text: {
                    fill: textColor,
                  },
                },
              },
              grid: {
                line: {
                  stroke: circleColor,
                },
              },
            }}
            isInteractive={false}
          />
        </div>
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
