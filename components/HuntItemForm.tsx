'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from './ui/button';
import { ScavengerHunt } from '@/lib/schemas/hunt';
import { HuntItemFormData, HuntItemSchema } from '@/lib/schemas/huntItem';

const HuntItemForm = ({
  defaultValues = {
    title: '',
    description: '',
    hint: '',
    imageUrl: '',
    lat: 0,
    lng: 0,
  },
  hunt,
}: {
  defaultValues?: HuntItemFormData;
  hunt: ScavengerHunt;
}) => {
  const form = useForm({
    resolver: zodResolver(HuntItemSchema),
    defaultValues,
  });
};
