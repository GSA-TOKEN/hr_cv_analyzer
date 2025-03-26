import React, { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define types for demographic filters
interface DemographicFilters {
    age?: [number, number];
    department?: string;
    expectedSalary?: [number, number];
    firstName?: string;
    lastName?: string;
}

interface DemographicFilterDropdownProps {
    onFilterChange: (filters: DemographicFilters) => void;
    initialFilters?: DemographicFilters;
}

const DEFAULT_AGE_RANGE: [number, number] = [18, 65];
const DEFAULT_SALARY_RANGE: [number, number] = [0, 200000];

const DemographicFilterDropdown: React.FC<DemographicFilterDropdownProps> = ({
    onFilterChange,
    initialFilters = {}
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<DemographicFilters>(initialFilters);

    // Apply initial filters
    useEffect(() => {
        // Only set filters if they're different from current filters
        if (JSON.stringify(initialFilters) !== JSON.stringify(filters)) {
            setFilters(initialFilters);
        }
    }, []); // Run only on mount

    // Count active filters
    const activeFilterCount = Object.keys(filters).filter(key => {
        const value = filters[key as keyof DemographicFilters];
        if (Array.isArray(value)) {
            // For range filters, check if they differ from defaults
            if (key === 'age') {
                return value[0] !== DEFAULT_AGE_RANGE[0] || value[1] !== DEFAULT_AGE_RANGE[1];
            }
            if (key === 'expectedSalary') {
                return value[0] !== DEFAULT_SALARY_RANGE[0] || value[1] !== DEFAULT_SALARY_RANGE[1];
            }
            return true;
        }
        return value && value.length > 0;
    }).length;

    // Update filters and notify parent
    const updateFilters = (newFilters: DemographicFilters) => {
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({});
        onFilterChange({});
    };

    // Format currency for display
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Demographics</span>
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96 max-h-[80vh] overflow-auto">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Demographic Filters</span>
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={(e) => {
                                e.preventDefault();
                                clearFilters();
                            }}
                        >
                            <X className="mr-1 h-3 w-3" /> Clear filters
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup className="p-2">
                    <div className="space-y-4">
                        {/* Name filters */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="firstName" className="text-xs">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="First Name"
                                    value={filters.firstName || ''}
                                    onChange={(e) => updateFilters({ ...filters, firstName: e.target.value || undefined })}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Last Name"
                                    value={filters.lastName || ''}
                                    onChange={(e) => updateFilters({ ...filters, lastName: e.target.value || undefined })}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>

                        {/* Department filter */}
                        <div>
                            <Label htmlFor="department" className="text-xs">Department</Label>
                            <Input
                                id="department"
                                placeholder="Department"
                                value={filters.department || ''}
                                onChange={(e) => updateFilters({ ...filters, department: e.target.value || undefined })}
                                className="h-8 text-sm"
                            />
                        </div>

                        {/* Age Range */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="text-xs">Age Range</Label>
                                <span className="text-xs text-muted-foreground">
                                    {filters.age?.[0] || DEFAULT_AGE_RANGE[0]} - {filters.age?.[1] || DEFAULT_AGE_RANGE[1]}
                                </span>
                            </div>
                            <Slider
                                defaultValue={filters.age || DEFAULT_AGE_RANGE}
                                min={18}
                                max={65}
                                step={1}
                                onValueChange={(value) => updateFilters({ ...filters, age: value as [number, number] })}
                                className="my-2"
                            />
                        </div>

                        {/* Expected Salary Range */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="text-xs">Expected Salary</Label>
                                <span className="text-xs text-muted-foreground">
                                    {formatCurrency(filters.expectedSalary?.[0] || DEFAULT_SALARY_RANGE[0])} -
                                    {formatCurrency(filters.expectedSalary?.[1] || DEFAULT_SALARY_RANGE[1])}
                                </span>
                            </div>
                            <Slider
                                defaultValue={filters.expectedSalary || DEFAULT_SALARY_RANGE}
                                min={0}
                                max={200000}
                                step={5000}
                                onValueChange={(value) => updateFilters({ ...filters, expectedSalary: value as [number, number] })}
                                className="my-2"
                            />
                        </div>
                    </div>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default DemographicFilterDropdown; 