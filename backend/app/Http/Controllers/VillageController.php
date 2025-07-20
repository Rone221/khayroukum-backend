<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Village;
use Illuminate\Support\Facades\Auth;

class VillageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Village::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required',
            'region' => 'required',
            'localisation_gps' => 'nullable',
            'description' => 'nullable',
            'prioritaire' => 'boolean',
        ]);

        $data['created_by'] = Auth::id();

        $village = Village::create($data);

        return response()->json($village, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Village::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $village = Village::findOrFail($id);
        $village->update($request->all());
        return $village;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Village::findOrFail($id)->delete();
        return response()->noContent();
    }
}
