'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { ModelCard } from '@/components/model-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { Model } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, ArrowRightLeft, FileText, DollarSign, Package, Tags, Building, SlidersHorizontal } from 'lucide-react';
import { filterAndSortModels } from '@/ai/flows/filter-and-sort-models';
import { getUniqueProviders, getUniqueSeries, getUniqueCategories } from '@/services/model-service';

export default function Home() {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortOption, setSortOption] = useState('weeklyUsage');

  const [allProviders, setAllProviders] = useState<string[]>([]);
  const [allSeries, setAllSeries] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const [filters, setFilters] = useState({
    modalities: [] as string[],
    contextLength: [4000, 1000000],
    promptPricing: [0, 10],
    series: [] as string[],
    categories: [] as string[],
    providers: [] as string[],
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [providers, series, categories] = await Promise.all([
          getUniqueProviders(),
          getUniqueSeries(),
          getUniqueCategories(),
        ]);
        setAllProviders(providers);
        setAllSeries(series);
        setAllCategories(categories);
      } catch (err) {
        console.error("Failed to fetch filter options", err);
      }
    };
    fetchFilterOptions();
  }, []);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await filterAndSortModels({
        searchTerm: debouncedSearchTerm,
        sortOption,
        filters,
      });
      setModels(result);
    } catch (err) {
      setError('Failed to fetch models. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, sortOption, filters]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);


  const handleFilterChange = (filterType: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleCheckboxChange = (filterType: 'modalities' | 'series' | 'categories' | 'providers', item: string, checked: boolean | 'indeterminate') => {
    const currentItems = filters[filterType];
    const newItems = checked ? [...currentItems, item] : currentItems.filter(i => i !== item);
    handleFilterChange(filterType, newItems);
  };
  
  const FilterSidebar = () => (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-[65px] items-center px-4 border-b">
        <h2 className="font-semibold text-lg tracking-tight">Filters</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <Accordion type="multiple" defaultValue={['modalities', 'context', 'pricing', 'series', 'categories', 'providers']} className="px-2">
          <AccordionItem value="modalities" className="border-none">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Input Modalities
              </div>
            </AccordionTrigger>
            <AccordionContent className="grid gap-2">
              {['Text', 'Image', 'Audio'].map((mod) => (
                <div key={mod} className="flex items-center space-x-2 pl-4">
                  <Checkbox id={`mod-${mod}`} checked={filters.modalities.includes(mod)} onCheckedChange={(checked) => handleCheckboxChange('modalities', mod, checked)} />
                  <Label htmlFor={`mod-${mod}`}>{mod}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="context" className="border-none">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Context Length
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-2">
              <Slider
                min={4000}
                max={1000000}
                step={1000}
                value={filters.contextLength}
                onValueChange={(value) => handleFilterChange('contextLength', value)}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>4K</span>
                <span>1M</span>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="pricing" className="border-none">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Prompt Pricing
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-2">
              <Slider
                min={0}
                max={10}
                step={0.5}
                value={filters.promptPricing}
                onValueChange={(value) => handleFilterChange('promptPricing', value)}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>FREE</span>
                <span>$10+</span>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="series" className="border-none">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Series
              </div>
            </AccordionTrigger>
            <AccordionContent className="grid gap-2">
              {allSeries.map((series) => (
                <div key={series} className="flex items-center space-x-2 pl-4">
                  <Checkbox id={`series-${series}`} checked={filters.series.includes(series)} onCheckedChange={(checked) => handleCheckboxChange('series', series, checked)} />
                  <Label htmlFor={`series-${series}`}>{series}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="categories" className="border-none">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Categories
              </div>
            </AccordionTrigger>
            <AccordionContent className="grid gap-2">
              {allCategories.map((cat) => (
                <div key={cat} className="flex items-center space-x-2 pl-4">
                  <Checkbox id={`cat-${cat}`} checked={filters.categories.includes(cat)} onCheckedChange={(checked) => handleCheckboxChange('categories', cat, checked)} />
                  <Label htmlFor={`cat-${cat}`}>{cat}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="providers" className="border-none">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Providers
              </div>
            </AccordionTrigger>
            <AccordionContent className="grid gap-2 max-h-48 overflow-y-auto">
              {allProviders.map((provider) => (
                <div key={provider} className="flex items-center space-x-2 pl-4">
                  <Checkbox id={`prov-${provider}`} checked={filters.providers.includes(provider)} onCheckedChange={(checked) => handleCheckboxChange('providers', provider, checked)} />
                  <Label htmlFor={`prov-${provider}`}>{provider}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );

  const ModelList = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(9)].map((_, i) => (
             <div key={i} className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-16 text-destructive"><p>{error}</p></div>
    }

    if (models.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          <h3 className="text-lg font-semibold">No models found</h3>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      );
    }
    
    return (
      <div className="relative w-full">
        <ul className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      <div className="mx-auto flex w-full max-w-screen-2xl">
        <aside className="sticky top-16 z-10 hidden h-[calc(100vh-4rem)] w-72 flex-shrink-0 flex-col gap-0 overflow-visible border-r py-8 pr-6 md:flex">
          <FilterSidebar />
        </aside>
        <main className="w-full px-4 md:px-8 xl:px-12">
          <div className="sticky top-16 z-20 bg-background/80 py-8 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-semibold text-2xl md:text-3xl">
                Models <span className="text-muted-foreground text-lg">({isLoading ? '...' : models.length})</span>
              </h1>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter models..."
                  className="w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                 <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
                  /
                </kbd>
              </div>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weeklyUsage">Trending</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="contextLength">Context</SelectItem>
                  <SelectItem value="inputPrice">Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <ModelList />

        </main>
      </div>

      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
             <FilterSidebar />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
