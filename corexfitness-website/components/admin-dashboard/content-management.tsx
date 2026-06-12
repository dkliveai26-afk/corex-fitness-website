"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createContentId,
  defaultWebsiteContent,
  type EditableContactCard,
  type EditableDietPlan,
  type EditableGalleryImage,
  type EditableOffer,
  type EditablePlan,
  type EditableTrainer,
  type WebsiteContent
} from "@/lib/website-content";
import { formatPlanCurrency, getPlanPricing } from "@/components/site/plan-pricing";
import { saveWebsiteContent, uploadContentImage, useWebsiteContent } from "@/lib/website-content-client";

const fieldClass = "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition focus:border-red-400";
const labelClass = "block text-xs font-black uppercase tracking-[0.18em] text-zinc-400";
const panelClass = "rounded-[1.75rem] border border-white/10 bg-[#111217]/95 p-4 shadow-card sm:p-6";
const panelFooterClass = "mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between";

type SaveStatus = {
  message: string;
  panel: string;
  status: "idle" | "saving" | "success" | "error";
};

type SaveControls = {
  onReset: (panel: string) => void;
  onSave: (panel: string) => Promise<void>;
  saveStatus: SaveStatus;
};

export function ContentManagementPanel() {
  const { content, error, isLoading } = useWebsiteContent();
  const [draft, setDraft] = useState<WebsiteContent>(defaultWebsiteContent);
  const [, setSavedSnapshot] = useState<WebsiteContent>(defaultWebsiteContent);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ message: "", panel: "", status: "idle" });
  const draftRef = useRef<WebsiteContent>(defaultWebsiteContent);
  const savedSnapshotRef = useRef<WebsiteContent>(defaultWebsiteContent);

  useEffect(() => {
    if (!isDirty) {
      const nextContent = cloneWebsiteContent(content);
      setDraft(nextContent);
      draftRef.current = nextContent;
      setSavedSnapshot(nextContent);
      savedSnapshotRef.current = nextContent;
    }
  }, [content, isDirty]);

  function updateDraft(nextContent: WebsiteContent) {
    const nextDraft = cloneWebsiteContent(nextContent);
    setDraft(nextDraft);
    draftRef.current = nextDraft;
    setIsDirty(true);
    setSaveStatus((current) => current.status === "saving" ? current : { message: "", panel: "", status: "idle" });
  }

  async function saveContent(panel = "Website CMS") {
    setSaveStatus({ message: "Saving changes...", panel, status: "saving" });
    try {
      const latestDraft = cloneWebsiteContent(draftRef.current);
      const saved = await saveWebsiteContent(latestDraft);
      const nextSaved = cloneWebsiteContent(saved);
      setDraft(nextSaved);
      draftRef.current = nextSaved;
      setSavedSnapshot(nextSaved);
      savedSnapshotRef.current = nextSaved;
      setIsDirty(false);
      setSaveStatus({ message: `${panel} saved. Live website content updated.`, panel, status: "success" });
    } catch (saveError) {
      setIsDirty(true);
      const message = saveError instanceof Error && saveError.message
        ? saveError.message
        : "check Firebase rules/config and try again";
      setSaveStatus({ message: `${panel} was not saved. Your edits are still in draft; ${message}.`, panel, status: "error" });
    }
  }

  function resetDraft(panel = "Website CMS") {
    const latestSaved = cloneWebsiteContent(savedSnapshotRef.current);
    setDraft(latestSaved);
    draftRef.current = latestSaved;
    setIsDirty(false);
    setSaveStatus({ message: "Unsaved edits reset to the latest saved content.", panel, status: "success" });
  }

  const activeCounts = useMemo(() => ({
    gallery: draft.gallery.filter((item) => item.enabled).length,
    offers: draft.offers.filter((item) => item.enabled).length,
    plans: draft.plans.filter((item) => item.enabled).length,
    trainers: draft.trainers.filter((item) => item.enabled).length
  }), [draft]);

  const cmsControls = { onReset: resetDraft, onSave: saveContent, saveStatus };

  return (
    <div className="grid gap-6">
      <section className={panelClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Website CMS</p>
            <h2 className="mt-2 text-2xl font-black">Content Management</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Edit website text, images, plans, offers, gallery, trainers, and page sections. Changes are saved to Firebase Firestore; image fields can use public paths or full image URLs.
            </p>
          </div>
          <button
            className="rounded-full bg-red-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saveStatus.status === "saving"}
            onClick={() => void saveContent("Website CMS")}
            type="button"
          >
            {saveStatus.status === "saving" ? "Saving..." : "Save All Changes"}
          </button>
        </div>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <CmsStat label="Plans" value={activeCounts.plans} />
          <CmsStat label="Offers" value={activeCounts.offers} />
          <CmsStat label="Gallery Images" value={activeCounts.gallery} />
          <CmsStat label="Trainers" value={activeCounts.trainers} />
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`rounded-xl border p-3 text-sm font-bold ${
            isDirty
              ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
              : "border-white/10 bg-white/[0.04] text-zinc-300"
          }`}>
            {isDirty ? "You have unsaved CMS edits." : "CMS draft matches the latest saved content."}
          </p>
          <button className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase text-zinc-200 transition hover:border-red-400" onClick={() => resetDraft("Website CMS")} type="button">
            Reset Draft
          </button>
        </div>
        {saveStatus.message ? <StatusMessage status={saveStatus.status} text={saveStatus.message} /> : null}
        {error ? <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm font-bold text-red-200">{error}</p> : null}
        {isLoading ? <p className="mt-4 text-sm text-zinc-500">Loading live Firebase content...</p> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <HeroPanel draft={draft} setDraft={updateDraft} {...cmsControls} />
        <OfferPanel draft={draft} setDraft={updateDraft} {...cmsControls} />
      </section>

      <AboutPanel draft={draft} setDraft={updateDraft} {...cmsControls} />
      <PlansPanel draft={draft} setDraft={updateDraft} {...cmsControls} />
      <GalleryPanel draft={draft} setDraft={updateDraft} {...cmsControls} />
      <TrainersPanel draft={draft} setDraft={updateDraft} {...cmsControls} />
      <SectionControlPanel draft={draft} setDraft={updateDraft} {...cmsControls} />
      <DietContactPanel draft={draft} setDraft={updateDraft} {...cmsControls} />
      <FooterPanel draft={draft} setDraft={updateDraft} {...cmsControls} />
    </div>
  );
}

function HeroPanel({ draft, onReset, onSave, saveStatus, setDraft }: CmsPanelProps) {
  return (
    <section className={panelClass}>
      <CmsPanelTitle eyebrow="Home Page" title="Hero Banner Management" />
      <div className="mt-5 grid gap-4">
        <ImageUrlField folder="hero-banners" label="Hero Banner Image" value={draft.hero.image} onChange={(image) => setDraft({ ...draft, hero: { ...draft.hero, image } })} />
        <TextField label="Hero Title" value={draft.hero.title} onChange={(title) => setDraft({ ...draft, hero: { ...draft.hero, title }, sections: { ...draft.sections, home: { ...draft.sections.home, title } } })} />
        <TextAreaField label="Hero Subtitle" value={draft.hero.subtitle} onChange={(subtitle) => setDraft({ ...draft, hero: { ...draft.hero, subtitle }, sections: { ...draft.sections, home: { ...draft.sections.home, subtitle } } })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Primary Button Text" value={draft.hero.primaryButtonText} onChange={(primaryButtonText) => setDraft({ ...draft, hero: { ...draft.hero, primaryButtonText } })} />
          <TextField label="Secondary Button Text" value={draft.hero.secondaryButtonText} onChange={(secondaryButtonText) => setDraft({ ...draft, hero: { ...draft.hero, secondaryButtonText } })} />
        </div>
      </div>
      <PanelActions onReset={onReset} onSave={onSave} panel="Hero Banner" saveStatus={saveStatus} />
    </section>
  );
}

function OfferPanel({ draft, onReset, onSave, saveStatus, setDraft }: CmsPanelProps) {
  function updateOffer(index: number, patch: Partial<EditableOffer>) {
    setDraft({ ...draft, offers: draft.offers.map((offer, offerIndex) => offerIndex === index ? { ...offer, ...patch } : offer) });
  }

  return (
    <section className={panelClass}>
      <div className="flex items-start justify-between gap-4">
        <CmsPanelTitle eyebrow="Offers" title="Offer Banner Management" />
        <button className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase text-white transition hover:border-red-400" onClick={() => setDraft({ ...draft, offers: [{ discountText: "20% OFF", enabled: true, eyebrow: "Limited Offer", id: createContentId("offer"), image: "", offerPercent: "20", text: "on membership", title: "New Offer" }, ...draft.offers] })} type="button">
          Add Offer
        </button>
      </div>
      <div className="mt-5 grid gap-4">
        {draft.offers.map((offer, index) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={offer.id}>
            <div className="flex items-center justify-between gap-3">
              <ToggleField checked={offer.enabled} label="Enabled" onChange={(enabled) => updateOffer(index, { enabled })} />
              <button className="text-xs font-black uppercase text-red-300 transition hover:text-red-100" onClick={() => setDraft({ ...draft, offers: draft.offers.filter((item) => item.id !== offer.id) })} type="button">Delete</button>
            </div>
            <div className="mt-4 grid gap-4">
              <ImageUrlField folder="offer-banners" label="Offer Banner Image" value={offer.image} onChange={(image) => updateOffer(index, { image })} />
              <TextField label="Offer Title" value={offer.title} onChange={(title) => updateOffer(index, { title })} />
              <TextField label="Offer Percent" value={offer.offerPercent || offer.discountText.replace(/[^\d.]/g, "") || "20"} onChange={(offerPercent) => updateOffer(index, { discountText: `${offerPercent}% OFF`, offerPercent })} />
              <TextField label="Small Text" value={offer.text} onChange={(text) => updateOffer(index, { text })} />
            </div>
          </div>
        ))}
      </div>
      <PanelActions onReset={onReset} onSave={onSave} panel="Offer Banners" saveStatus={saveStatus} />
    </section>
  );
}

function AboutPanel({ draft, onReset, onSave, saveStatus, setDraft }: CmsPanelProps) {
  function updateValue(index: number, patch: Partial<{ text: string; title: string }>) {
    setDraft({
      ...draft,
      about: {
        ...draft.about,
        values: draft.about.values.map((value, valueIndex) => valueIndex === index ? { ...value, ...patch } : value)
      }
    });
  }

  function updateImage(index: number, image: string) {
    setDraft({
      ...draft,
      about: {
        ...draft.about,
        images: draft.about.images.map((item, imageIndex) => imageIndex === index ? image : item)
      }
    });
  }

  return (
    <section className={panelClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CmsPanelTitle eyebrow="About Page" title="About Content + Images" />
        <button
          className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase text-white transition hover:border-red-400"
          onClick={() => setDraft({ ...draft, about: { ...draft.about, images: [...draft.about.images, ""] } })}
          type="button"
        >
          Add Image
        </button>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <ImageUrlField folder="about" label="Top About Hero Image" value={draft.about.heroImage} onChange={(heroImage) => setDraft({ ...draft, about: { ...draft.about, heroImage } })} />
          <TextField label="About Hero Title" value={draft.about.heroTitle} onChange={(heroTitle) => setDraft({ ...draft, about: { ...draft.about, heroTitle }, sections: { ...draft.sections, about: { ...draft.sections.about, title: heroTitle } } })} />
          <TextAreaField label="About Hero Subtitle" value={draft.about.heroSubtitle} onChange={(heroSubtitle) => setDraft({ ...draft, about: { ...draft.about, heroSubtitle }, sections: { ...draft.sections, about: { ...draft.sections.about, subtitle: heroSubtitle } } })} />
          <TextField label="Difference Heading" value={draft.about.differenceTitle} onChange={(differenceTitle) => setDraft({ ...draft, about: { ...draft.about, differenceTitle } })} />
          <ArrayField label="Difference Points" values={draft.about.differences} onChange={(differences) => setDraft({ ...draft, about: { ...draft.about, differences } })} />
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-black uppercase tracking-[0.16em] text-red-300">Mission / Vision Cards</h4>
              <button
                className="rounded-full border border-white/10 px-3 py-2 text-xs font-black uppercase text-white transition hover:border-red-400"
                onClick={() => setDraft({ ...draft, about: { ...draft.about, values: [...draft.about.values, { text: "Short description", title: "New Value" }] } })}
                type="button"
              >
                Add Card
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {draft.about.values.map((value, index) => (
                <div className="rounded-xl border border-white/10 bg-black/20 p-3" key={`${value.title}-${index}`}>
                  <div className="flex justify-end">
                    <button
                      className="text-xs font-black uppercase text-red-300 transition hover:text-red-100"
                      onClick={() => setDraft({ ...draft, about: { ...draft.about, values: draft.about.values.filter((_, valueIndex) => valueIndex !== index) } })}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-2 grid gap-3">
                    <TextField label="Title" value={value.title} onChange={(title) => updateValue(index, { title })} />
                    <TextAreaField label="Text" value={value.text} onChange={(text) => updateValue(index, { text })} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h4 className="text-sm font-black uppercase tracking-[0.16em] text-red-300">Moving Image Track</h4>
            <div className="mt-4 grid max-h-[28rem] gap-3 overflow-y-auto pr-1">
              {draft.about.images.map((image, index) => (
                <div className="rounded-xl border border-white/10 bg-black/20 p-3" key={`${image}-${index}`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-wide text-zinc-400">Image {index + 1}</p>
                    <button
                      className="text-xs font-black uppercase text-red-300 transition hover:text-red-100"
                      onClick={() => setDraft({ ...draft, about: { ...draft.about, images: draft.about.images.filter((_, imageIndex) => imageIndex !== index) } })}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                  <ImageUrlField folder="about" label="Track Image URL" value={image} onChange={(nextImage) => updateImage(index, nextImage)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <PanelActions onReset={onReset} onSave={onSave} panel="About Content" saveStatus={saveStatus} />
    </section>
  );
}

function PlansPanel({ draft, onReset, onSave, saveStatus, setDraft }: CmsPanelProps) {
  function updatePlan(index: number, patch: Partial<EditablePlan>) {
    setDraft({ ...draft, plans: draft.plans.map((plan, planIndex) => planIndex === index ? { ...plan, ...patch } : plan) });
  }

  function movePlan(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draft.plans.length) return;
    const nextPlans = [...draft.plans];
    const [movedPlan] = nextPlans.splice(index, 1);
    nextPlans.splice(targetIndex, 0, movedPlan);
    setDraft({ ...draft, plans: nextPlans });
  }

  return (
    <section className={panelClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CmsPanelTitle eyebrow="Plans Page" title="Plans Management" />
        <button className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase text-white transition hover:border-red-400" onClick={() => setDraft({ ...draft, plans: [...draft.plans, { buttonText: "Book Now", description: "Plan description", duration: "1 Month", enabled: true, features: ["Gym Access"], id: createContentId("plan"), mrpPrice: "2000", name: "New Plan", offerPercent: "20", price: "1600" }] })} type="button">
          Add Plan
        </button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {draft.plans.map((plan, index) => {
          const pricing = getPlanPricing(plan);

          return (
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={plan.id}>
              <div className="flex items-center justify-between gap-3">
                <ToggleField checked={plan.enabled} label="Enabled" onChange={(enabled) => updatePlan(index, { enabled })} />
                <button className="text-xs font-black uppercase text-red-300 transition hover:text-red-100" onClick={() => setDraft({ ...draft, plans: draft.plans.filter((item) => item.id !== plan.id) })} type="button">Remove</button>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-black uppercase text-zinc-200 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-40" disabled={index === 0} onClick={() => movePlan(index, -1)} type="button">Move Up</button>
                <button className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-black uppercase text-zinc-200 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-40" disabled={index === draft.plans.length - 1} onClick={() => movePlan(index, 1)} type="button">Move Down</button>
              </div>
              <div className="mt-4 grid gap-3">
                <TextField label="Plan Name" value={plan.name} onChange={(name) => updatePlan(index, { name })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Original Price / MRP" value={plan.mrpPrice || plan.price} onChange={(mrpPrice) => updatePlan(index, { mrpPrice })} />
                  <TextField label="Offer Percent" value={plan.offerPercent || "20"} onChange={(offerPercent) => updatePlan(index, { offerPercent })} />
                </div>
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100">
                  Auto final price: Rs. {formatPlanCurrency(pricing.finalPrice)} after {pricing.offerPercent}% OFF
                </div>
                <TextField label="Duration" value={plan.duration} onChange={(duration) => updatePlan(index, { duration })} />
                <TextField label="Badge Text" value={plan.badge || ""} onChange={(badge) => updatePlan(index, { badge })} />
                <TextField label="Button Text" value={plan.buttonText || "Book Now"} onChange={(buttonText) => updatePlan(index, { buttonText })} />
                <TextAreaField label="Description" value={plan.description} onChange={(description) => updatePlan(index, { description })} />
                <ArrayField label="Features" values={plan.features} onChange={(features) => updatePlan(index, { features })} />
              </div>
            </article>
          );
        })}
      </div>
      <PanelActions onReset={onReset} onSave={onSave} panel="Plans" saveStatus={saveStatus} />
    </section>
  );
}

function GalleryPanel({ draft, onReset, onSave, saveStatus, setDraft }: CmsPanelProps) {
  function updateImage(index: number, patch: Partial<EditableGalleryImage>) {
    setDraft({ ...draft, gallery: draft.gallery.map((image, imageIndex) => imageIndex === index ? { ...image, ...patch } : image) });
  }

  function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draft.gallery.length) return;
    const nextGallery = [...draft.gallery];
    const [movedImage] = nextGallery.splice(index, 1);
    nextGallery.splice(targetIndex, 0, movedImage);
    setDraft({ ...draft, gallery: nextGallery });
  }

  return (
    <section className={panelClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CmsPanelTitle eyebrow="Gallery Page" title="Gallery Management" />
        <button className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase text-white transition hover:border-red-400" onClick={() => setDraft({ ...draft, gallery: [{ alt: "New gallery image", category: "Gym Interior", enabled: true, id: createContentId("gallery"), size: "standard", src: "" }, ...draft.gallery] })} type="button">
          Add Image
        </button>
      </div>
      <div className="mt-5 grid max-h-[36rem] gap-4 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
        {draft.gallery.map((image, index) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={image.id}>
            <div className="flex items-center justify-between gap-3">
              <ToggleField checked={image.enabled} label="Enabled" onChange={(enabled) => updateImage(index, { enabled })} />
              <button className="text-xs font-black uppercase text-red-300 transition hover:text-red-100" onClick={() => setDraft({ ...draft, gallery: draft.gallery.filter((item) => item.id !== image.id) })} type="button">Delete</button>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-black uppercase text-zinc-200 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-40" disabled={index === 0} onClick={() => moveImage(index, -1)} type="button">Move Up</button>
              <button className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-black uppercase text-zinc-200 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-40" disabled={index === draft.gallery.length - 1} onClick={() => moveImage(index, 1)} type="button">Move Down</button>
            </div>
            <div className="mt-4 grid gap-3">
              <ImageUrlField folder="gallery" label="Image" value={image.src} onChange={(src) => updateImage(index, { src })} />
              <TextField label="Alt Text" value={image.alt} onChange={(alt) => updateImage(index, { alt })} />
              <TextField label="Category" value={image.category} onChange={(category) => updateImage(index, { category })} />
              <SelectField label="Size" value={image.size} options={["standard", "tall", "wide"]} onChange={(size) => updateImage(index, { size: size as EditableGalleryImage["size"] })} />
            </div>
          </article>
        ))}
      </div>
      <PanelActions onReset={onReset} onSave={onSave} panel="Gallery" saveStatus={saveStatus} />
    </section>
  );
}

function TrainersPanel({ draft, onReset, onSave, saveStatus, setDraft }: CmsPanelProps) {
  function updateTrainer(index: number, patch: Partial<EditableTrainer>) {
    setDraft({ ...draft, trainers: draft.trainers.map((trainer, trainerIndex) => trainerIndex === index ? { ...trainer, ...patch } : trainer) });
  }

  return (
    <section className={panelClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CmsPanelTitle eyebrow="Trainer Page" title="Trainer Management" />
        <button className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase text-white transition hover:border-red-400" onClick={() => setDraft({ ...draft, trainers: [...draft.trainers, { certificationCount: "1", certifications: ["Certified Trainer"], description: "Trainer description", enabled: true, experience: "1+ Years", expertise: ["Weight Training"], image: "", intro: "Trainer intro", membersTrained: "100+", name: "New Trainer", price: "", skills: ["Fitness Coaching"], slug: createContentId("trainer"), specialization: "Fitness" }] })} type="button">
          Add Trainer
        </button>
      </div>
      <div className="mt-5 grid max-h-[44rem] gap-4 overflow-y-auto pr-1 xl:grid-cols-2">
        {draft.trainers.map((trainer, index) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={trainer.slug}>
            <div className="flex items-center justify-between gap-3">
              <ToggleField checked={trainer.enabled} label="Enabled" onChange={(enabled) => updateTrainer(index, { enabled })} />
              <button className="text-xs font-black uppercase text-red-300 transition hover:text-red-100" onClick={() => setDraft({ ...draft, trainers: draft.trainers.filter((item) => item.slug !== trainer.slug) })} type="button">Remove</button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ImageUrlField folder="trainers" label="Trainer Image" value={trainer.image} onChange={(image) => updateTrainer(index, { image })} />
              <TextField label="Name" value={trainer.name} onChange={(name) => updateTrainer(index, { name })} />
              <TextField label="Slug" value={trainer.slug} onChange={(slug) => updateTrainer(index, { slug })} />
              <TextField label="Specialization" value={trainer.specialization} onChange={(specialization) => updateTrainer(index, { specialization })} />
              <TextField label="Experience" value={trainer.experience} onChange={(experience) => updateTrainer(index, { experience })} />
              <TextField label="Pricing" value={trainer.price} onChange={(price) => updateTrainer(index, { price })} />
              <TextAreaField label="Card Description" value={trainer.description} onChange={(description) => updateTrainer(index, { description })} />
              <TextAreaField label="Profile Intro" value={trainer.intro} onChange={(intro) => updateTrainer(index, { intro })} />
              <ArrayField label="Skills" values={trainer.skills} onChange={(skills) => updateTrainer(index, { skills })} />
              <ArrayField label="Certifications" values={trainer.certifications} onChange={(certifications) => updateTrainer(index, { certifications, certificationCount: String(certifications.length) })} />
              <ArrayField label="Expertise" values={trainer.expertise} onChange={(expertise) => updateTrainer(index, { expertise })} />
            </div>
          </article>
        ))}
      </div>
      <PanelActions onReset={onReset} onSave={onSave} panel="Trainers" saveStatus={saveStatus} />
    </section>
  );
}

function SectionControlPanel({ draft, onReset, onSave, saveStatus, setDraft }: CmsPanelProps) {
  const sectionEntries = Object.entries(draft.sections) as [keyof WebsiteContent["sections"], WebsiteContent["sections"][keyof WebsiteContent["sections"]]][];

  return (
    <section className={panelClass}>
      <CmsPanelTitle eyebrow="Website Section Control" title="Page Text + Enable/Disable" />
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sectionEntries.map(([key, section]) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={key}>
            <ToggleField checked={section.enabled} label={`${key} page enabled`} onChange={(enabled) => setDraft({ ...draft, sections: { ...draft.sections, [key]: { ...section, enabled } } })} />
            <div className="mt-4 grid gap-3">
              <TextField label="Eyebrow" value={section.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, sections: { ...draft.sections, [key]: { ...section, eyebrow } } })} />
              <TextField label="Title" value={section.title} onChange={(title) => setDraft({ ...draft, sections: { ...draft.sections, [key]: { ...section, title } } })} />
              <TextAreaField label="Subtitle" value={section.subtitle} onChange={(subtitle) => setDraft({ ...draft, sections: { ...draft.sections, [key]: { ...section, subtitle } } })} />
            </div>
          </article>
        ))}
      </div>
      <PanelActions onReset={onReset} onSave={onSave} panel="Page Section Text" saveStatus={saveStatus} />
    </section>
  );
}

function DietContactPanel({ draft, onReset, onSave, saveStatus, setDraft }: CmsPanelProps) {
  function updateDietPlan(index: number, patch: Partial<EditableDietPlan>) {
    setDraft({ ...draft, dietPlans: draft.dietPlans.map((plan, planIndex) => planIndex === index ? { ...plan, ...patch } : plan) });
  }

  function updateContactCard(index: number, patch: Partial<EditableContactCard>) {
    setDraft({ ...draft, contact: { ...draft.contact, cards: draft.contact.cards.map((card, cardIndex) => cardIndex === index ? { ...card, ...patch } : card) } });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className={panelClass}>
        <div className="flex items-start justify-between gap-4">
          <CmsPanelTitle eyebrow="Diet Page" title="Diet Cards Management" />
          <button
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase text-white transition hover:border-red-400"
            onClick={() => setDraft({ ...draft, dietPlans: [...draft.dietPlans, { calories: "2,000", description: "Diet description", enabled: true, id: createContentId("diet"), image: "", meals: "4", protein: "120g", title: "New Diet Plan" }] })}
            type="button"
          >
            Add Diet
          </button>
        </div>
        <div className="mt-5 grid max-h-[34rem] gap-4 overflow-y-auto pr-1">
          {draft.dietPlans.map((plan, index) => (
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={plan.id}>
              <div className="flex items-center justify-between gap-3">
                <ToggleField checked={plan.enabled} label="Enabled" onChange={(enabled) => updateDietPlan(index, { enabled })} />
                <button className="text-xs font-black uppercase text-red-300 transition hover:text-red-100" onClick={() => setDraft({ ...draft, dietPlans: draft.dietPlans.filter((item) => item.id !== plan.id) })} type="button">Delete</button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ImageUrlField folder="diet" label="Food Image" value={plan.image} onChange={(image) => updateDietPlan(index, { image })} />
                <TextField label="Title" value={plan.title} onChange={(title) => updateDietPlan(index, { title })} />
                <TextAreaField label="Description" value={plan.description} onChange={(description) => updateDietPlan(index, { description })} />
                <TextField label="Calories" value={plan.calories} onChange={(calories) => updateDietPlan(index, { calories })} />
                <TextField label="Protein" value={plan.protein} onChange={(protein) => updateDietPlan(index, { protein })} />
                <TextField label="Meals" value={plan.meals} onChange={(meals) => updateDietPlan(index, { meals })} />
              </div>
            </article>
          ))}
        </div>
        <PanelActions onReset={onReset} onSave={onSave} panel="Diet Cards" saveStatus={saveStatus} />
      </div>

      <div className={panelClass}>
        <div className="flex items-start justify-between gap-4">
          <CmsPanelTitle eyebrow="Contact Page" title="Contact + Map Management" />
          <button
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase text-white transition hover:border-red-400"
            onClick={() => setDraft({ ...draft, contact: { ...draft.contact, cards: [...draft.contact.cards, { enabled: true, id: createContentId("contact"), note: "Short note", title: "New Contact", value: "Value" }] } })}
            type="button"
          >
            Add Card
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          <TextField label="Google Map Embed URL" value={draft.contact.mapSrc} onChange={(mapSrc) => setDraft({ ...draft, contact: { ...draft.contact, mapSrc } })} />
          <TextField label="Visit Title" value={draft.contact.visitTitle} onChange={(visitTitle) => setDraft({ ...draft, contact: { ...draft.contact, visitTitle } })} />
          <TextAreaField label="Visit Text" value={draft.contact.visitSubtitle} onChange={(visitSubtitle) => setDraft({ ...draft, contact: { ...draft.contact, visitSubtitle } })} />
          <ArrayField label="Visit Notes" values={draft.contact.visitNotes} onChange={(visitNotes) => setDraft({ ...draft, contact: { ...draft.contact, visitNotes } })} />
          {draft.contact.cards.map((card, index) => (
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={card.id}>
              <div className="flex items-center justify-between gap-3">
                <ToggleField checked={card.enabled} label={card.title} onChange={(enabled) => updateContactCard(index, { enabled })} />
                <button className="text-xs font-black uppercase text-red-300 transition hover:text-red-100" onClick={() => setDraft({ ...draft, contact: { ...draft.contact, cards: draft.contact.cards.filter((item) => item.id !== card.id) } })} type="button">Delete</button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <TextField label="Title" value={card.title} onChange={(title) => updateContactCard(index, { title })} />
                <TextField label="Value" value={card.value} onChange={(value) => updateContactCard(index, { value })} />
                <TextAreaField label="Note" value={card.note} onChange={(note) => updateContactCard(index, { note })} />
              </div>
            </article>
          ))}
        </div>
        <PanelActions onReset={onReset} onSave={onSave} panel="Contact Info" saveStatus={saveStatus} />
      </div>
    </section>
  );
}

function FooterPanel({ draft, onReset, onSave, saveStatus, setDraft }: CmsPanelProps) {
  function updateSocialLink(index: number, patch: Partial<WebsiteContent["socialLinks"][number]>) {
    setDraft({
      ...draft,
      socialLinks: draft.socialLinks.map((social, socialIndex) => socialIndex === index ? { ...social, ...patch } : social)
    });
  }

  return (
    <section className={panelClass}>
      <CmsPanelTitle eyebrow="Footer" title="Footer Content Management" />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ImageUrlField folder="footer" label="Footer Logo URL / Path" value={draft.footer.logoSrc} onChange={(logoSrc) => setDraft({ ...draft, footer: { ...draft.footer, logoSrc } })} />
        <TextField label="Brand Name" value={draft.footer.brandName} onChange={(brandName) => setDraft({ ...draft, footer: { ...draft.footer, brandName } })} />
        <TextField label="Contact Email" value={draft.footer.email} onChange={(email) => setDraft({ ...draft, footer: { ...draft.footer, email } })} />
        <TextField label="Contact Phone" value={draft.footer.phone} onChange={(phone) => setDraft({ ...draft, footer: { ...draft.footer, phone } })} />
        <TextField label="Contact Address" value={draft.footer.address} onChange={(address) => setDraft({ ...draft, footer: { ...draft.footer, address } })} />
        <TextField label="Copyright Text" value={draft.footer.copyright} onChange={(copyright) => setDraft({ ...draft, footer: { ...draft.footer, copyright } })} />
        <div className="lg:col-span-2">
          <TextAreaField label="Footer Description" value={draft.footer.description} onChange={(description) => setDraft({ ...draft, footer: { ...draft.footer, description } })} />
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-black uppercase tracking-[0.16em] text-red-300">Social Links</h4>
          <button
            className="rounded-full border border-white/10 px-3 py-2 text-xs font-black uppercase text-white transition hover:border-red-400"
            onClick={() => setDraft({ ...draft, socialLinks: [...draft.socialLinks, { enabled: true, href: "https://", id: createContentId("social"), label: "New Link" }] })}
            type="button"
          >
            Add Link
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {draft.socialLinks.map((social, index) => (
            <article className="rounded-xl border border-white/10 bg-black/20 p-3" key={social.id}>
              <div className="flex items-center justify-between gap-3">
                <ToggleField checked={social.enabled} label={social.label} onChange={(enabled) => updateSocialLink(index, { enabled })} />
                <button className="text-xs font-black uppercase text-red-300 transition hover:text-red-100" onClick={() => setDraft({ ...draft, socialLinks: draft.socialLinks.filter((item) => item.id !== social.id) })} type="button">Delete</button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <TextField label="Label" value={social.label} onChange={(label) => updateSocialLink(index, { label })} />
                <TextField label="URL" value={social.href} onChange={(href) => updateSocialLink(index, { href })} />
              </div>
            </article>
          ))}
        </div>
      </div>
      <PanelActions onReset={onReset} onSave={onSave} panel="Footer Content" saveStatus={saveStatus} />
    </section>
  );
}

type CmsPanelProps = {
  draft: WebsiteContent;
  setDraft: (content: WebsiteContent) => void;
} & SaveControls;

function CmsPanelTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-black sm:text-2xl">{title}</h3>
    </div>
  );
}

function StatusMessage({ status, text }: { status: SaveStatus["status"]; text: string }) {
  const isError = status === "error";
  const isSaving = status === "saving";

  return (
    <p className={`mt-4 rounded-xl border p-3 text-sm font-bold ${
      isError
        ? "border-red-400/30 bg-red-400/10 text-red-100"
        : isSaving
          ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
          : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
    }`}>
      {text}
    </p>
  );
}

function PanelActions({ onReset, onSave, panel, saveStatus }: SaveControls & { panel: string }) {
  const isActive = saveStatus.panel === panel;
  const isSaving = isActive && saveStatus.status === "saving";

  return (
    <div className={panelFooterClass}>
      <div className="min-w-0">
        {isActive && saveStatus.message ? (
          <p className={`text-sm font-bold ${saveStatus.status === "error" ? "text-red-200" : saveStatus.status === "saving" ? "text-amber-100" : "text-emerald-200"}`}>
            {saveStatus.message}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">Save this section when edits are ready.</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <button
          className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase text-zinc-200 transition hover:border-red-400 hover:text-white"
          onClick={() => onReset(panel)}
          type="button"
        >
          Reset
        </button>
        <button
          className="rounded-full bg-red-600 px-5 py-3 text-xs font-black uppercase text-white shadow-red transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          onClick={() => void onSave(panel)}
          type="button"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function CmsStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function TextField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className={labelClass}>
      {label}
      <input className={fieldClass} onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  );
}

function TextAreaField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className={labelClass}>
      {label}
      <textarea className={`${fieldClass} min-h-24 resize-y`} onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  );
}

function SelectField({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value: string }) {
  return (
    <label className={labelClass}>
      {label}
      <select className={fieldClass} onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ArrayField({ label, onChange, values }: { label: string; onChange: (values: string[]) => void; values: string[] }) {
  return (
    <label className={labelClass}>
      {label}
      <textarea
        className={`${fieldClass} min-h-28 resize-y`}
        onChange={(event) => onChange(event.target.value.split("\n").map((value) => value.trim()).filter(Boolean))}
        value={values.join("\n")}
      />
    </label>
  );
}

function ToggleField({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-wide text-zinc-300">
      <input checked={checked} className="size-4 accent-red-600" onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      {label}
    </label>
  );
}

function ImageUrlField({ folder, label, onChange, value }: { folder: string; label: string; onChange: (value: string) => void; value: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleUpload(file?: File) {
    if (!file) return;
    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextPreviewUrl;
    });
    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const url = await uploadContentImage(file, folder);
      if (!url) {
        throw new Error("Local image save failed");
      }
      onChange(url);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
      setUploadSuccess("Image saved locally. Press Save Changes to publish it.");
    } catch (uploadError) {
      const message = uploadError instanceof Error && uploadError.message ? uploadError.message : "Image upload failed";
      setUploadError(`${message}. Use a public image URL/path or check the admin session.`);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <TextField label={label} value={value} onChange={onChange} />
      {previewUrl || value ? (
        <div className="relative mt-1 h-24 overflow-hidden rounded-xl border border-white/10 bg-black/30">
          <img alt="" className="h-full w-full object-cover" src={previewUrl || value} />
        </div>
      ) : null}
      <input
        className="block w-full text-xs text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:text-white"
        disabled={isUploading}
        onChange={(event) => void handleUpload(event.target.files?.[0])}
        type="file"
        accept="image/*"
      />
      {isUploading ? <p className="text-xs font-bold text-red-200">Preview ready. Saving local image...</p> : null}
      {uploadSuccess ? <p className="text-xs font-bold text-emerald-200">{uploadSuccess}</p> : null}
      {uploadError ? <p className="text-xs font-bold text-red-200">{uploadError}</p> : null}
    </div>
  );
}

function cloneWebsiteContent(content: WebsiteContent): WebsiteContent {
  if (typeof structuredClone === "function") {
    return structuredClone(content);
  }

  return JSON.parse(JSON.stringify(content)) as WebsiteContent;
}
